package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.ComponentUrls
import org.corespring.container.client.hooks.EditorHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model.Component
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.Mode
import play.api.Mode.Mode
import play.api.libs.json.{ Json, JsObject, JsValue }
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest
import play.api.test.Helpers._

import scala.concurrent.{ Future, ExecutionContext }

class EditorTest extends Specification with Mockito {

  class editorScope(val hookResponse: Either[StatusMessage, JsValue]) extends Scope {

    val editor = new Editor {

      override def versionInfo: JsObject = Json.obj()

      override def hooks: EditorHooks = {
        val m = mock[EditorHooks]
        m.load(anyString)(any[RequestHeader]) returns Future(hookResponse)
        m
      }

      override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global

      override def urls: ComponentUrls = {
        val m = mock[ComponentUrls]
        m.cssUrl(anyString, any[Seq[Component]], any[Boolean]) returns Seq("url.css")
        m.jsUrl(anyString, any[Seq[Component]], any[Boolean]) returns Seq("url.js")
        m
      }

      override def components: Seq[Component] = Seq.empty

      override def mode: Mode = Mode.Dev
    }
  }

  "Editor" should {
    "when calling edit item" should {

      "honor a SEE_OTHER" in new editorScope(Left(SEE_OTHER, "other-url")) {
        val r = editor.load("itemId")(FakeRequest("", ""))
        status(r) === SEE_OTHER
        header(LOCATION, r) === Some("other-url")
      }

      "show the error page" in new editorScope(Left(BAD_REQUEST, "bad")) {
        val r = editor.load("itemId")(FakeRequest("", ""))
        status(r) === BAD_REQUEST
        contentAsString(r) === org.corespring.container.client.views.html.error.main(BAD_REQUEST, "bad", true).toString
      }
    }
  }
}
