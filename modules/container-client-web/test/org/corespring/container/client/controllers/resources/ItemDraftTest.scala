package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import org.corespring.container.client.controllers.resources.ItemDraft.Errors
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._
import play.api.test.Helpers._
import play.api.test.{ WithApplication, FakeApplication, FakeRequest }

import scala.concurrent.{ ExecutionContext, Future }

object mockGlobalq extends play.api.GlobalSettings

class ItemDraftTest extends Specification with Mockito {

  class item(
    createError: Option[StatusMessage] = None,
    globalConf: Option[play.api.GlobalSettings] = Some(mockGlobalq),
    loadResult: JsValue = Json.obj("_id" -> Json.obj("$oid" -> "1"), "xhtml" -> "<div></div>"))
    extends WithApplication(FakeApplication(withGlobal = globalConf))
    with Scope {
    val item = new ItemDraft {

      override def hooks: ItemDraftHooks = new ItemDraftHooks {

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

        override def saveProfile(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future(Right(Json.obj()))

        override def saveXhtml(itemId: String, xhtml: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future(Right(Json.obj()))

        override def saveSupportingMaterials(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future(Right(Json.obj()))

        override def saveComponents(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future(Right(Json.obj()))

        override def saveSummaryFeedback(itemId: String, feedback: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future(Right(Json.obj()))

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

    "fail to save if no json is supplied" in new item {
      val result = item.saveSubset("x", "xhtml")(FakeRequest())
      status(result) === BAD_REQUEST
      (contentAsJson(result) \ "error").as[String] === Errors.noJson
    }

    "create returns error" in new item(createError = Some(UNAUTHORIZED -> "Error"), globalConf = Some(mockGlobalq)) {
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
