package org.corespring.container.client.controllers.resources

import org.corespring.container.client.HasContext
import org.corespring.container.client.controllers.resources.Session.Errors
import org.corespring.container.client.controllers.resources.session.ItemPruner
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json._
import play.api.mvc.{ Action, Controller, SimpleResult }

object Session {
  object Errors {
    val cantSaveWhenComplete = "secure mode: can't save when session is complete"
    val cantResetSecureSession = "secure mode: can't reset secure session"
  }
}

trait Session extends Controller with ItemPruner with HasContext {

  val logger = ContainerLogger.getLogger("container.Session")

  def outcomeProcessor: OutcomeProcessor

  def itemPreProcessor: PlayerItemPreProcessor

  def scoreProcessor: ScoreProcessor

  def hooks: SessionHooks

  implicit def toResult(m: StatusMessage): SimpleResult = play.api.mvc.Results.Status(m._1)(Json.obj("error" -> m._2))

  private def basicHandler[A](success: (A => SimpleResult))(
    e: Either[StatusMessage, A]): SimpleResult = e match {
    case Left(err) => err
    case Right(json) => success(json)
  }

  def load(id: String) = Action.async { implicit request =>
    hooks.load(id).map(basicHandler(Ok(_)))
  }

  def resetSession(id: String) = Action.async { implicit request =>
    hooks.save(id).map(basicHandler { ss =>
      if (ss.isSecure)
        BadRequest(Json.obj("error" -> JsString(Errors.cantResetSecureSession)))
      else {
        def resetSession(session: JsValue) = {
          session.as[JsObject] ++
            Json.obj("isComplete" -> false) ++
            Json.obj("components" -> Json.obj()) ++
            Json.obj("attempts" -> 0)
        }

        ss.saveSession(id, resetSession(ss.existingSession)).map {
          savedSession =>
            logger.trace(s"reset - session has been saved as: $savedSession")
            Ok(savedSession)
        }.getOrElse(BadRequest("Error saving resetted session"))
      }
    })
  }

  def loadItemAndSession(sessionId: String) = Action.async { implicit request =>
    hooks.loadItemAndSession(sessionId).map(basicHandler { fs =>

      val json = fs.everything

      val itemJson = (json \ "item").as[JsObject]
      val prunedItem = pruneItem(itemJson)
      val sessionJson = (json \ "session").as[JsObject]
      val processedItem = itemPreProcessor.preProcessItemForPlayer(prunedItem)

      val base = Json.obj(
        "item" -> processedItem,
        "session" -> sessionJson)

      Ok(base)
    })
  }

  def saveSession(id: String) = Action.async { implicit request =>
    hooks.save(id).map(basicHandler { ss =>

      logger.trace(s"[saveSession] : $id")

      if (ss.isSecure && ss.isComplete)
        BadRequest(Json.obj("error" -> JsString(Errors.cantSaveWhenComplete)))
      else {
        request.body.asJson.map {
          requestJson =>

            val isAttempt: Boolean = (requestJson \ "isAttempt").asOpt[Boolean].getOrElse(false)
            val isComplete: Boolean = (requestJson \ "isComplete").asOpt[Boolean].getOrElse(false)

            val attemptUpdate = if (isAttempt) {
              val currentCount = (ss.existingSession \ "attempts").asOpt[Int].getOrElse(0)
              Json.obj("attempts" -> JsNumber(currentCount + 1))
            } else Json.obj()

            val completeUpdate = if (isComplete) Json.obj("isComplete" -> JsBoolean(true)) else Json.obj()

            val update = ss.existingSession.as[JsObject] ++
              Json.obj("components" -> requestJson \ "components") ++
              attemptUpdate ++ completeUpdate

            ss.saveSession(id, update).map {
              savedSession =>
                logger.trace(s"session has been saved as: $savedSession")
                Ok(savedSession)
            }.getOrElse(BadRequest("Error saving"))
        }.getOrElse(BadRequest("No session in the request body"))
      }
    })
  }

  /**
   * Load outcome for a session.
   * @param id
   * request body : json - a set of evaluation options to be passed in to the outcome processors
   * @return
   */
  def loadOutcome(id: String) = Action.async { implicit request =>
    hooks.loadOutcome(id).map(basicHandler { (so: SessionOutcome) =>

      logger.trace(s"[loadOutcome]: $id : ${Json.stringify(so.itemSession)}")

      def hasAnswers = (so.itemSession \ "components").asOpt[JsObject].isDefined

      if (so.isSecure && !so.isComplete) {
        BadRequest(Json.obj("error" -> JsString("secure mode: can't load outcome - session isn't complete")))
      } else if (!hasAnswers) {
        BadRequest(Json.obj("error" -> JsString("Can't create an outcome if no answers have been saved")))
      } else {
        request.body.asJson.map{ settings =>
          val outcome = outcomeProcessor.createOutcome(so.item, so.itemSession, settings)
          val score = scoreProcessor.score(so.item, so.itemSession, outcome)
          Ok(Json.obj("outcome" -> outcome) ++ Json.obj("score" -> score))
        }.getOrElse{
          BadRequest(Json.obj("error" -> "No settings in request body"))
        }
      }
    })
  }

  /**
   * Be aware that this is two different implementations melted into one api.
   * The http route for it is a PUT which allows the user to pass in the answers.
   * When secure=false these answers are used to calculate the result
   * When secure=true the answers are ignored and the answers from the session are used instead.
   * @param id
   * @return
   */
  def getScore(id: String) = Action.async { implicit request =>
    hooks.getScore(id).map {
      basicHandler({ (so: SessionOutcome) =>

        val answers: Either[String, JsValue] = {

          if (so.isSecure) {
            if (!so.isComplete) {
              Left("Can't get score if session has not been completed")
            } else {
              (so.itemSession \ "components").asOpt[JsValue].map { _ =>
                Right(so.itemSession)
              }.getOrElse(Left("Can't calculate a score if there are no saved answers"))
            }
          } else {
            request.body.asJson
              .orElse((so.itemSession \ "components").asOpt[JsValue].map(_ => so.itemSession))
              .map(Right(_))
              .getOrElse(Left("Can't find answers in request body or in the db"))
          }
        }

        answers match {
          case Left(err) => BadRequest(Json.obj("error" -> err))
          case Right(a) =>
            logger.trace(s"[getScore]: $id : ${Json.stringify(a)}")
            val outcome = outcomeProcessor.createOutcome(so.item, a, Json.obj())
            val score = scoreProcessor.score(so.item, a, outcome)
            Ok(score)
        }
      })
    }
  }

  def completeSession(id: String) = Action.async { implicit request =>
    hooks.save(id).map(basicHandler({ (ss: SaveSession) =>
      val sessionJson = ss.existingSession.as[JsObject] ++ Json.obj("isComplete" -> JsBoolean(true))
      ss.saveSession(id, sessionJson).map {
        savedSession =>
          Ok(savedSession)
      }.getOrElse(BadRequest("Error completing"))
    }))
  }

}
