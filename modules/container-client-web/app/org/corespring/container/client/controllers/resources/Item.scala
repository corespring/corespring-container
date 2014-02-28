package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions.{ ScoreItemRequest, ItemActions, SaveItemRequest, ItemRequest }
import org.corespring.container.client.controllers.resources.Item.Errors
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import play.api.libs.json.{ JsNumber, JsBoolean, Json }
import play.api.mvc.{ AnyContent, Controller }
import play.api.Logger

object Item {

  object Errors {
    val noJson = "No json in request body"
    val errorSaving = "Error Saving"
    val invalidXhtml = "Invalid xhtml"
  }

}

trait Item extends Controller {

  private lazy val logger = Logger("container.item")

  def actions: ItemActions[AnyContent]

  def scoreProcessor: ScoreProcessor

  def outcomeProcessor: OutcomeProcessor

  def settings = Json.obj(
    "maxNoOfAttempts" -> JsNumber(2),
    "showFeedback" -> JsBoolean(true),
    "highlightCorrectResponse" -> JsBoolean(true),
    "highlightUserResponse" -> JsBoolean(true),
    "allowEmptyResponses" -> JsBoolean(true))

  def create = actions.create {
    (code, msg) =>
      Status(code)(Json.obj("error" -> msg))
  } {
    request => Ok(Json.obj("itemId" -> request.itemId))
  }

  def load(itemId: String) = actions.load(itemId) {
    request: ItemRequest[AnyContent] =>
      Ok(Json.obj("item" -> request.item))
  }

  def save(itemId: String, property : Option[String] = None) = actions.save(itemId) {
    request: SaveItemRequest[AnyContent] =>
      request.body.asJson.map {

        logger.debug(s"save: $itemId")

        json =>

          def validXhtml = try {
            scala.xml.XML.loadString((json \ "xhtml").as[String])
            true
          } catch {
            case e: Throwable => {
              logger.error(s"error parsing xhtml: ${e.getMessage}")
              false
            }
          }

          def saveResult = request.save(itemId, json, property).map {
              updatedItem =>
                Ok(updatedItem)
            }.getOrElse(BadRequest(Errors.errorSaving))

          if(property.isEmpty){
            if(validXhtml){
              saveResult
            } else{
              BadRequest(Errors.invalidXhtml)
            }
          } else {
             saveResult
          }

      }.getOrElse(BadRequest(Errors.noJson))
  }

  def getScore(id: String) = actions.getScore(id) {
    request: ScoreItemRequest[AnyContent] =>
      request.body.asJson.map {
        answers =>
          val responses = outcomeProcessor.createOutcome(request.item, answers, settings)
          val outcome = scoreProcessor.score(request.item, Json.obj(), responses)
          Ok(outcome)
      }.getOrElse(BadRequest(Errors.noJson))
  }

}
