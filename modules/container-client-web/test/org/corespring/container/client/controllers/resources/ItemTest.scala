package org.corespring.container.client.controllers.resources

import org.specs2.mutable.Specification
import org.corespring.container.components.response.OutcomeProcessor
import org.corespring.container.client.actions._
import play.api.mvc.{ AnyContentAsJson, Action, Result, AnyContent }
import org.corespring.container.components.outcome.ScoreProcessor
import play.api.test.{ FakeHeaders, FakeRequest }
import play.api.test.Helpers._
import org.specs2.mock.Mockito
import play.api.libs.json.{ JsString, JsValue, Json }
import org.specs2.specification.Scope
import org.corespring.container.client.controllers.resources.Item.Errors
import play.api.test.FakeHeaders
import org.corespring.container.client.actions.SaveItemRequest
import play.api.mvc.AnyContentAsJson
import org.corespring.container.client.actions.ScoreItemRequest
import play.api.libs.json.JsString
import scala.Some
import org.corespring.container.client.actions.ItemRequest

class ItemTest extends Specification with Mockito {

  class item(saveResult: Option[JsValue] = Some(Json.obj()), createError: Option[(Int, String)] = None) extends Scope {
    val item = new Item {

      def actions: ItemActions[AnyContent] = new ItemActions[AnyContent] {

        def save(itemId: String)(block: (SaveItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
          request => block(SaveItemRequest(Json.obj(), (s, j, property) => saveResult, request))
        }

        def load(itemId: String)(block: (ItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
          request =>
            block(ItemRequest(Json.obj(), request))
        }

        override def create(error: (Int, String) => Result)(block: (NewItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
          request =>

            createError.map {
              e =>
                error(e._1, e._2)
            }.getOrElse {
              block(NewItemRequest("new_id", request))
            }
        }
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
      val result = item.save("x")(FakeRequest("", "", FakeHeaders(), AnyContentAsJson(Json.obj("xhtml" -> JsString("<root/>")))))
      status(result) === BAD_REQUEST
      contentAsString(result) === Errors.errorSaving
    }

    "save if save worked" in new item {
      val result = item.save("x")(FakeRequest("", "", FakeHeaders(), AnyContentAsJson(Json.obj("xhtml" -> JsString("<root/>")))))
      status(result) === OK
      contentAsString(result) === "{}"
    }

    "create returns error" in new item(createError = Some(UNAUTHORIZED -> "Error")) {
      val result = item.create(FakeRequest("", ""))
      status(result) === UNAUTHORIZED
      contentAsJson(result) === Json.obj("error" -> "Error")
    }

    "create" in new item {
      val result = item.create(FakeRequest("", ""))
      status(result) === OK
      contentAsJson(result) === Json.obj("itemId" -> "new_id")
    }
  }
}
