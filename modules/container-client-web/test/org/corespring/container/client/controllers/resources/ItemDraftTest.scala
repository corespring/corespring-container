package org.corespring.container.client.controllers.resources

import org.corespring.container.client.ItemAssetResolver
import org.corespring.container.client.controllers.helpers.PlayerXhtml
import org.corespring.container.client.controllers.resources.ItemDraft.Errors
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import org.corespring.container.client.integration.ContainerExecutionContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._
import play.api.test.FakeRequest
import play.api.test.Helpers._

import scala.concurrent.{ ExecutionContext, Future }

class ItemDraftTest extends Specification with Mockito {

  trait BaseDraft extends ItemDraft {

    override def containerContext: ContainerExecutionContext = new ContainerExecutionContext(ExecutionContext.global)

    override protected def componentTypes: Seq[String] = Seq.empty

    override def materialHooks: SupportingMaterialHooks = {
      val m = mock[SupportingMaterialHooks]
      m
    }

    override def playerXhtml = new PlayerXhtml {
      override def itemAssetResolver = new ItemAssetResolver{}
    }
  }

  trait DH extends CoreItemHooks with DraftHooks

  import ExecutionContext.Implicits.global

  "ItemDraft" should {

    "load" should {

      val json = Json.obj(
        "_id" -> Json.obj("$oid" -> "1"),
        "xhtml" -> "<div></div>")

      class load(loadResult: JsValue = json)
        extends Scope {
        val draft = new BaseDraft {
          val hooks: DH = {
            val m = mock[DH] //.verbose
            m.load(anyString)(any[RequestHeader]) returns Future(Right(loadResult))
            m
          }
        }
      }

      s"return $OK" in new load {
        status(draft.load("x")(FakeRequest("", ""))) === OK
      }

      val badJson = Json.obj(
        "xhtml" -> "<p>a</p>")

      "prep the json" in new load(loadResult = badJson) {
        val json = contentAsJson(draft.load("x")(FakeRequest("", "")))
        (json \ "itemId").as[String] === "x"
        (json \ "xhtml").as[String] === """<div class="para">a</div>"""
      }
    }

    "saveSubset" should {

      class save(saveResult: JsValue = Json.obj())
        extends Scope {
        val draft = new BaseDraft {
          val hooks: DH = {
            val m = mock[DH]
            m.saveXhtml(anyString, anyString)(any[RequestHeader]) returns Future(Right(saveResult))
            m
          }
        }
      }

      "fail to save if no json is supplied" in new save() {
        val result = draft.saveSubset("x", "xhtml")(FakeRequest())
        status(result) === BAD_REQUEST
        (contentAsJson(result) \ "error").as[String] === Errors.noJson
      }
    }

    "save" should {

      class save(saveResult: JsValue = Json.obj())
        extends Scope {
        val draft = new BaseDraft {
          val hooks: DH = {
            val m = mock[DH]
            m.save(anyString, any[JsValue])(any[RequestHeader]) returns Future(Right(saveResult))
            m
          }
        }
      }

      "fail to save if no json is supplied" in new save() {
        val result = draft.save("x")(FakeRequest())
        status(result) must be equalTo (BAD_REQUEST)
        (contentAsJson(result) \ "error").as[String] must be equalTo (Errors.noJson)
      }

      val json = Json.obj("this" -> "is", "item" -> "json")

      "return 200 on success" in new save(json) {
        val result = draft.save("x")(FakeRequest().withJsonBody(json))
        status(result) must be equalTo (OK)
      }

      "return result from DraftHooks#save on success" in new save(json) {
        val result = draft.save("x")(FakeRequest().withJsonBody(json))
        contentAsJson(result) must be equalTo (json)
      }

    }

    "commit" should {

      class commit(commitResult: Future[Either[StatusMessage, JsValue]] = Future(Right(Json.obj()))) extends Scope {
        val draft = new BaseDraft {
          val hooks: DH = {
            val m = mock[DH]
            m.commit(anyString, any[Boolean])(any[RequestHeader]) returns commitResult
            m
          }
        }
      }

      "set force to false" in new commit() {
        val fr = FakeRequest("", "")
        draft.commit("draftId")(fr)
        there was one(draft.hooks).commit("draftId", false)(fr)
      }

      "set force to true" in new commit() {
        val fr = FakeRequest("", "?force=true")
        draft.commit("draftId")(fr)
        there was one(draft.hooks).commit("draftId", true)(fr)
      }

    }

  }
}
