package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import org.corespring.container.client.controllers.resources.Item.Errors
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.{ JsString, JsValue, Json }
import play.api.mvc._
import play.api.test.Helpers._
import play.api.test.{ FakeHeaders, FakeRequest }

import scala.concurrent.{ ExecutionContext, Future }

class ItemTest extends Specification with Mockito {

  class item(saveResult: Option[JsValue] = Some(Json.obj()), createError: Option[StatusMessage] = None) extends Scope {
    val item = new Item {

      override def hooks: ItemHooks = new ItemHooks {

        override def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[StatusMessage, String]] = {
          Future {
            createError.map {
              e =>
                Left(e)
            }.getOrElse(Right("new_id"))
          }
        }

        override def load(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = {
          Future {
            Right(Json.obj())
          }
        }

        override def saveProfile(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future(Right(Json.obj()))

        override def saveXhtml(itemId: String, xhtml: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future(Right(Json.obj()))

        override def saveSupportingMaterials(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future(Right(Json.obj()))

        override def saveComponents(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future(Right(Json.obj()))

        override def saveSummaryFeedback(itemId: String, feedback: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future(Right(Json.obj()))
      }

      override implicit def ec: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global
    }
  }

  "Item" should {
    "load" in new item {
      status(item.load("x")(FakeRequest("", ""))) === OK
    }

    "fail to save if no json is supplied" in new item {
      val result = item.saveSubset("x", "xhtml")(FakeRequest())
      status(result) === BAD_REQUEST
      (contentAsJson(result) \ "error").as[String] === Errors.noJson
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
