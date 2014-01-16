package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions.{ScoreItemRequest, ItemActionBuilder, SaveItemRequest, ItemRequest}
import org.corespring.container.client.controllers.resources.Item.Errors
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import play.api.libs.json.{JsNumber, JsBoolean, Json}
import play.api.mvc.{AnyContent, Controller}

object Item{
  object Errors{
    val noJson =  "No json in request body"
    val errorSaving = "Error Saving"
  }
}

trait Item extends Controller {

  def builder : ItemActionBuilder[AnyContent]

  def scoreProcessor: ScoreProcessor
  def outcomeProcessor : OutcomeProcessor


  def settings = Json.obj(
  "maxNoOfAttempts"  -> JsNumber(2),
  "showFeedback" -> JsBoolean(true),
  "highlightCorrectResponse" -> JsBoolean(true),
  "highlightUserResponse"  -> JsBoolean(true),
  "allowEmptyResponses"  -> JsBoolean(true)
  )

  def load(itemId:String) = builder.load(itemId) { request : ItemRequest[AnyContent] =>
    Ok(Json.obj("item" -> request.item))
  }

  def save(itemId:String) = builder.save(itemId){ request : SaveItemRequest[AnyContent] =>
    request.body.asJson.map { json =>
      request.save(itemId, json).map{ updatedItem =>
        Ok(updatedItem)
      }.getOrElse(BadRequest(Errors.errorSaving))
    }.getOrElse(BadRequest(Errors.noJson))
  }

  def getScore(id:String) = builder.getScore(id) {
    request : ScoreItemRequest[AnyContent] =>
      request.body.asJson.map{ answers =>
        val responses = outcomeProcessor.createOutcome(request.item, answers, settings)
        val outcome = scoreProcessor.score(request.item, Json.obj(), responses)
        Ok(outcome)
      }.getOrElse(BadRequest(Errors.noJson))
  }

}
