package org.corespring.container.client.controllers.resources

import org.specs2.mutable.Specification
import org.corespring.container.components.response.OutcomeProcessor
import org.corespring.container.client.actions.{SaveItemRequest, ItemRequest, ScoreItemRequest, ItemActionBuilder}
import play.api.mvc.{AnyContentAsJson, Action, Result, AnyContent}
import org.corespring.container.components.outcome.ScoreProcessor
import play.api.test.{FakeHeaders, FakeRequest}
import play.api.test.Helpers._
import org.specs2.mock.Mockito
import play.api.libs.json.{JsValue, Json}
import org.specs2.specification.Scope
import org.corespring.container.client.controllers.resources.Item.Errors

class ItemTest extends Specification with Mockito {


  class item(saveResult: Option[JsValue] = Some(Json.obj())) extends Scope {
    val item = new Item {

      def builder: ItemActionBuilder[AnyContent] = new ItemActionBuilder[AnyContent] {

        def save(itemId: String)(block: (SaveItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
          request => block(SaveItemRequest(Json.obj(), (s, j) => saveResult, request))
        }

        def load(itemId: String)(block: (ItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
          request =>
            block(ItemRequest(Json.obj(), request))
        }

        def getScore(itemId: String)(block: (ScoreItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
          request =>
            block(ScoreItemRequest(Json.obj(), request))
        }

      }

      def scoreProcessor: ScoreProcessor = {
        mock[ScoreProcessor].score(any[JsValue], any[JsValue], any[JsValue]) returns Json.obj()
      }

      def outcomeProcessor: OutcomeProcessor = {
        mock[OutcomeProcessor].createOutcome(any[JsValue], any[JsValue], any[JsValue]) returns Json.obj()
      }

    }
  }

  "Item" should {
    "load" in new item {
      status(item.load("x")(FakeRequest("", ""))) === OK
    }

    "fail to save if no json is supplied" in new item {
      val result = item.save("x")(FakeRequest())
      status(result) === BAD_REQUEST
      contentAsString(result) === Errors.noJson
    }

    "fail to save if save failed" in new item(saveResult = None) {
      val result = item.save("x")(FakeRequest("", "", FakeHeaders(), AnyContentAsJson(Json.obj())))
      status(result) === BAD_REQUEST
      contentAsString(result) === Errors.errorSaving
    }

    "save if save worked" in new item {
      val result = item.save("x")(FakeRequest("", "", FakeHeaders(), AnyContentAsJson(Json.obj())))
      status(result) === OK
      contentAsString(result) === "{}"
    }

    "fail to getScore if no json in body" in new item{
      val result = item.getScore("x")(FakeRequest())
      status(result) === BAD_REQUEST
      contentAsString(result) === Errors.noJson
    }

    "getScore if no json in body" in new item{
      val result = item.getScore("x")(FakeRequest("","",FakeHeaders(),AnyContentAsJson(Json.obj())))
      status(result) === OK
      contentAsString(result) === "{}"
    }
  }
}
