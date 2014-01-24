package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions._
import org.corespring.container.client.controllers.resources.session.ItemPruner
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import org.joda.time.DateTime
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{AnyContent, Controller}
import scala.Some

trait Session extends Controller with ItemPruner {

  val logger = Logger("session.controller")

  def outcomeProcessor: OutcomeProcessor

  def itemPreProcessor: PlayerItemPreProcessor

  def scoreProcessor: ScoreProcessor

  def builder: SessionActionBuilder[AnyContent]

  def load(id: String) = builder.load(id)(request => Ok((request.everything \ "session").as[JsValue]))

  def loadEverything(id: String) = builder.loadEverything(id) {
    request =>

      def includeOutcome = {
        val requested = request.getQueryString("includeOutcome").map {
          _ == "true"
        }.getOrElse(false)
        requested && (request.isSecure && request.isComplete)
      }

      val itemJson = (request.everything \ "item").as[JsObject]
      val prunedItem = pruneItem(itemJson)

      val sessionJson = (request.everything \ "session").as[JsObject]

      val processedItem = itemPreProcessor.preProcessItemForPlayer(prunedItem, sessionJson \ "settings")

      if (!includeOutcome) {
        Ok(
          Json.obj(
            "item" -> processedItem,
            "session" -> sessionJson)
        )
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
  }

  def saveSession(id: String) = builder.save(id) {
    request =>

      logger.trace(s"[saveSession] : $id")

      if (request.isSecure && request.isComplete)
        BadRequest(Json.obj("error" -> JsString("secure mode: can't save when session is complete")))
      else {
        request.body.asJson.map {
          requestJson =>

            val isAttempt: Boolean = (requestJson \ "isAttempt").asOpt[Boolean].getOrElse(false)
            val isComplete: Boolean = (requestJson \ "isComplete").asOpt[Boolean].getOrElse(false)

            val attemptUpdate = if (isAttempt) {
              val currentCount = (request.itemSession \ "attempts").asOpt[Int].getOrElse(0)
              Json.obj("attempts" -> JsNumber(currentCount + 1))
            } else Json.obj()

            val completeUpdate = if (isComplete) Json.obj("isComplete" -> JsBoolean(true)) else Json.obj()

            val update = request.itemSession.as[JsObject] ++
              Json.obj("components" -> requestJson \ "components") ++
              attemptUpdate ++ completeUpdate

            request.saveSession(id, update).map {
              savedSession =>
                logger.trace(s"session has been saved as: $savedSession")
                Ok(savedSession)
            }.getOrElse(BadRequest("Error saving"))
        }.getOrElse(BadRequest("No session in the request body"))
      }
  }

  def loadOutcome(id: String) = builder.loadOutcome(id) {
    request: SessionOutcomeRequest[AnyContent] =>
      logger.trace(s"[loadOutcome]: $id : ${Json.stringify(request.itemSession)}")

      if (request.isSecure && !request.isComplete) {
        BadRequest(Json.obj("error" -> JsString("secure mode: can't load outcome - session isn't complete")))
      } else {
        val options = request.body.asJson.getOrElse(Json.obj())
        val outcome = outcomeProcessor.createOutcome(request.item, request.itemSession, options)
        val score = scoreProcessor.score(request.item, request.itemSession, outcome)
        Ok(Json.obj("outcome" -> outcome) ++ Json.obj("score" -> score))
      }
  }

  def completeSession(id: String) = builder.save(id) {
    request: SaveSessionRequest[AnyContent] =>
      val sessionJson = request.itemSession.as[JsObject] ++ Json.obj("isComplete" -> JsBoolean(true))
      request.saveSession(id, sessionJson).map {
        savedSession =>
          Ok(savedSession)
      }.getOrElse(BadRequest("Error completing"))
  }

}
