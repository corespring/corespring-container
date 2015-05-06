package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks.ItemHooks
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest
import play.api.test.Helpers._

import scala.concurrent.{ExecutionContext, Future}

class CollectionTest extends Specification with Mockito {


  class item(
    createError: Option[StatusMessage] = None,
    loadResult: JsValue = Json.obj("_id" -> Json.obj("$oid" -> "1"), "xhtml" -> "<div></div>"))
    extends Scope {
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
            Right(loadResult)
          }
        }

        override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global
      }

      override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global

      override protected def componentTypes: Seq[String] = Seq.empty
    }

  }

  "Item" should {

    "load" should {
      s"return $OK" in new item {
        status(item.load("x")(FakeRequest("", ""))) === OK
      }

      "prep the json" in new item(loadResult = Json.obj("_id" ->
        Json.obj("$oid" -> "1"), "xhtml" -> "<p>a</p>")) {
        val json = contentAsJson(item.load("x")(FakeRequest("", "")))
        (json \ "itemId").as[String] === "1"
        (json \ "xhtml").as[String] === """<div class="para">a</div>"""
      }
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
