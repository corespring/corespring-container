package org.corespring.container.client.controllers.resources

import org.corespring.container.client.HasContext
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import org.corespring.container.client.controllers.resources.Session.Errors
import org.corespring.container.client.controllers.resources.session.ItemPruner
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{ Action, Controller, SimpleResult }

import scala.concurrent.ExecutionContext

object Session {
  object Errors {
    val cantSaveWhenComplete = "secure mode: can't save when session is complete"
    val cantResetSecureSession = "secure mode: can't reset secure session"
  }
}

trait Session extends Controller with ItemPruner with HasContext {

  val logger = Logger("session.controller")

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
    hooks.reset(id).map(basicHandler { rs =>
      if( rs.isSecure )
        BadRequest(Json.obj("error" -> JsString(Errors.cantResetSecureSession)))
      else {
        rs.saveSession(id, rs.resettedSession).map {
          savedSession =>
            logger.trace(s"resetted session has been saved as: $savedSession")
            Ok(savedSession)
        }.getOrElse(BadRequest("Error saving resetted session"))
      }
    })
  }

  def loadEverything(id: String) = Action.async { implicit request =>
    hooks.loadEverything(id).map(basicHandler { fs =>

      val json = fs.everything

      def isCompleteFromSession(session: JsValue): Boolean = {
        (session \ "isComplete").asOpt[Boolean].getOrElse(false)
      }

      def includeOutcome = {
        val requested = request.getQueryString("includeOutcome").map {
          _ == "true"
        }.getOrElse(false)

        requested && (fs.isSecure && isCompleteFromSession(json \ "session"))
      }

      val itemJson = (json \ "item").as[JsObject]
      val prunedItem = pruneItem(itemJson)

      val sessionJson = (json \ "session").as[JsObject]

      val processedItem = itemPreProcessor.preProcessItemForPlayer(prunedItem, sessionJson \ "settings")

      if (!includeOutcome) {
        Ok(
          Json.obj(
            "item" -> processedItem,
            "session" -> sessionJson))
      } else {
        val outcome = outcomeProcessor.createOutcome(itemJson, sessionJson, sessionJson \ "settings")
        val score = scoreProcessor.score(itemJson, sessionJson, outcome)
        val out = Json.obj(
          "item" -> processedItem,
          "outcome" -> outcome,
          "score" -> score,
          "session" -> sessionJson)
        Ok(out)
      }
      Ok(json)
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
        val options = request.body.asJson.getOrElse(Json.obj())
        val outcome = outcomeProcessor.createOutcome(so.item, so.itemSession, options)
        val score = scoreProcessor.score(so.item, so.itemSession, outcome)
        Ok(Json.obj("outcome" -> outcome) ++ Json.obj("score" -> score))
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

        logger.trace(s"[getScore]: $id : ${Json.stringify(so.itemSession)}")

        if (so.isSecure) {
          def hasAnswers = (so.itemSession \ "components").asOpt[JsObject].isDefined
          if (!so.isComplete) {
            BadRequest(Json.obj("error" -> JsString("Can't get score if session has not been completed")))
          } else if (!hasAnswers) {
            BadRequest(Json.obj("error" -> JsString("Can't get score if no answers have been saved")))
          } else {
            val options = request.body.asJson.getOrElse(Json.obj())
            val outcome = outcomeProcessor.createOutcome(so.item, so.itemSession, options)
            val score = scoreProcessor.score(so.item, so.itemSession, outcome)
            Ok(score)
          }
        } else {
          def settings = Json.obj(
            "maxNoOfAttempts" -> JsNumber(2),
            "showFeedback" -> JsBoolean(true),
            "highlightCorrectResponse" -> JsBoolean(true),
            "highlightUserResponse" -> JsBoolean(true),
            "allowEmptyResponses" -> JsBoolean(true))

          request.body.asJson.map {
            answers =>
              val responses = outcomeProcessor.createOutcome(so.item, answers, settings)
              val score = scoreProcessor.score(so.item, Json.obj(), responses)
              Ok(score)
          }.getOrElse(BadRequest("No json in request body"))
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
