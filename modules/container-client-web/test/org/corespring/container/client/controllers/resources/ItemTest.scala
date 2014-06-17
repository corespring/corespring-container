package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions._
import org.corespring.container.client.controllers.resources.Item.Errors
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.{JsString, JsValue, Json}
import play.api.mvc._
import play.api.test.Helpers._
import play.api.test.{FakeHeaders, FakeRequest}

import scala.concurrent.{ExecutionContext, Future}

class ItemTest extends Specification with Mockito {

  class item(saveResult: Option[JsValue] = Some(Json.obj()), createError: Option[HttpStatusMessage] = None) extends Scope {
    val item = new Item {

      override def hooks: ItemHooks = new ItemHooks {

        override def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[HttpStatusMessage, String]] = {
          Future {
            createError.map {
              e =>
                Left(e)
            }.getOrElse(Right("new_id"))
          }
        }

        override def save(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, JsValue]] = {
          Future {
            saveResult.map {
              Right(_)
            }.getOrElse(Left(HttpStatusMessage(BAD_REQUEST,Errors.errorSaving)))
          }
        }

        override def load(itemId: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, JsValue]] = {
          Future {
            Right(Json.obj())
          }
        }
      }

      override implicit def ec: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global
    }
  }

  "Item" should {
    "load" in new item {
      status(item.load("x")(FakeRequest("", ""))) === OK
    }

    "fail to save if no json is supplied" in new item {
      val result = item.save("x")(FakeRequest())
      status(result) === BAD_REQUEST
      (contentAsJson(result) \ "error").as[String] === Errors.noJson
    }

    "fail to save if save failed" in new item(saveResult = None) {
      val result = item.save("x")(FakeRequest("", "", FakeHeaders(), AnyContentAsJson(Json.obj("xhtml" -> JsString("<root/>")))))
      status(result) === BAD_REQUEST
      (contentAsJson(result) \ "error").as[String] === Errors.errorSaving
    }

    "save if save worked" in new item {
      val result = item.save("x")(FakeRequest("", "", FakeHeaders(), AnyContentAsJson(Json.obj("xhtml" -> JsString("<root/>")))))
      status(result) === OK
      contentAsString(result) === "{}"
    }

    "create returns error" in new item(createError = Some(HttpStatusMessage(UNAUTHORIZED,"Error"))) {
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
