package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions.{SessionOutcomeRequest, SaveSessionRequest, SubmitSessionRequest, SessionActionBuilder}
import org.corespring.container.client.controllers.resources.session.ItemPruner
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import org.joda.time.DateTime
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{AnyContent, Controller}

trait Session extends Controller with ItemPruner {

  val logger = Logger("session")

  def outcomeProcessor: OutcomeProcessor

  def scoreProcessor: ScoreProcessor

  def builder: SessionActionBuilder[AnyContent]

  def load(id: String) = builder.load(id)(request => Ok((request.everything \ "session").as[JsValue]))

  def loadEverything(id: String) = builder.loadEverything(id){ request =>

    val itemJson = (request.everything \ "item").as[JsObject]
    val prunedItem = pruneItem(itemJson)
    val sessionJson = (request.everything \ "session").as[JsObject]
    val isFinished = (sessionJson \ "isFinished").asOpt[Boolean].getOrElse(false)

    if(!isFinished) {
      Ok(
        Json.obj(
          "item" -> prunedItem,
          "session" -> sessionJson)
      )
    } else {
      val outcome = outcomeProcessor.createOutcome(itemJson, sessionJson, sessionJson \ "settings")
      val score = scoreProcessor.score(itemJson, sessionJson, outcome)
      val out = Json.obj(
        "item" -> prunedItem,
        "outcome" -> outcome,
        "score" -> score,
        "session" -> sessionJson)
      Ok(out)
    }
  }


  def saveSession(id:String) = builder.save(id) {
    request : SaveSessionRequest[AnyContent] =>
      request.body.asJson.map{
        requestJson =>

          val isAttempt : Boolean = (requestJson \ "isAttempt").asOpt[Boolean].getOrElse(false)

          val attemptUpdate = if(isAttempt){
            val currentCount = (request.itemSession \ "attempts").asOpt[Int].getOrElse(0)
            Json.obj("attempts" -> JsNumber(currentCount + 1))
          } else Json.obj()

          val update = request.itemSession.as[JsObject]  ++
            Json.obj("components" -> requestJson \ "components") ++
            attemptUpdate

          request.saveSession(id, update).map{
            savedSession =>
              Ok(savedSession)
          }.getOrElse(BadRequest("Error saving"))
      }.getOrElse(BadRequest("No session in the request body"))
  }

  def loadOutcome(id: String) = builder.loadOutcome(id) {
    request: SessionOutcomeRequest[AnyContent] =>
      val options = request.body.asJson.getOrElse(Json.obj())
      val outcome = outcomeProcessor.createOutcome(request.item, request.itemSession, options)
      val score = scoreProcessor.score(request.item, request.itemSession, outcome)
      Ok(Json.obj("outcome" -> outcome) ++ Json.obj("score" -> score))
  }

  def completeSession(id: String) = builder.save(id) {
    request: SaveSessionRequest[AnyContent] =>
      val sessionJson = request.itemSession.as[JsObject] ++ Json.obj("isComplete" -> JsBoolean(true))
      request.saveSession(id, sessionJson).map {
        savedSession =>
          Ok(savedSession)
      }.getOrElse(BadRequest("Error completing"))
  }

  /**
   * @param id
   * @return
   */

  def submitSession(id: String) = builder.submitAnswers(id) {
    request : SubmitSessionRequest[AnyContent] =>

      request.body.asJson.map {
        session =>

          val sessionJson: JsObject = {
            val session = (request.everything \ "session").as[JsObject]
            (session \ "start").asOpt[JsNumber].map {
              s =>
                session
            }.getOrElse(session ++ Json.obj("start" -> JsNumber(DateTime.now.getMillis)))
          }

          val itemJson: JsObject = (request.everything \ "item").as[JsObject]
          val isFinished: Boolean = (sessionJson \ "isFinished").asOpt[Boolean].getOrElse(false)
          val currentRemainingAttempts: Int = (sessionJson \ "remainingAttempts").asOpt[Int].getOrElse(
            (sessionJson \ "settings" \ "maxNoOfAttempts").as[Int]
          )

          def output(session: JsValue, isFinished: Boolean) = {
            val base = Json.obj("session" -> session)
            if (isFinished) {
              val outcome = outcomeProcessor.createOutcome(itemJson, session, session \ "settings")
              val score = scoreProcessor.score(itemJson, session, outcome)
              base ++ Json.obj("outcome" -> outcome) ++ Json.obj("score" -> score)
            } else {
              base
            }
          }

          if (isFinished) {
            Ok(output(sessionJson, true))
          } else {
            logger.debug(s"current remaining attempts for $id: $currentRemainingAttempts")

            def updateJson = {

              val newRemainingAttempts: Number = Math.max(0, currentRemainingAttempts - 1)
              val finished = newRemainingAttempts == 0

              val updates: Seq[(String, JsValue)] = Seq(
                "remainingAttempts" -> JsNumber(newRemainingAttempts.intValue()),
                "components" -> (session \ "components").as[JsObject],
                "isFinished" -> JsBoolean(finished))

              val maybes: Seq[(String, JsValue)] = Seq(
                if (finished) Some(("finish" -> JsNumber(DateTime.now.getMillis))) else None
              ).flatten

              val out: JsObject = sessionJson ++ JsObject(updates ++ maybes)

              logger.debug( s"update json: ${Json.stringify(out)}")
              out
            }

            request.saveSession(id, updateJson).map {
              update =>
                if ((update \ "isFinished").as[Boolean]) {
                  Ok(output(update, true))
                } else {
                  Ok(output(update, false))
                }
            }
          }.getOrElse(BadRequest("Error updating"))

      }.getOrElse(BadRequest("no json body"))
  }
}
