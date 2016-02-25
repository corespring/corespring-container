package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.{ ComponentInfoJson, ComponentJson, ComponentBundler, ComponentUrls }
import org.corespring.container.client.hooks.EditorHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.pages.ComponentEditorRenderer
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.components.model.Component
import org.corespring.test.TestContext
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

  class editorScope(val hookResponse: Either[StatusMessage, JsValue]) extends Scope with TestContext {

    val editor = new DraftEditor with TestContext {

      override def versionInfo: JsObject = Json.obj()

      override def componentJson: ComponentJson = new ComponentInfoJson("path")

      override def hooks: EditorHooks = {
        val m = mock[EditorHooks]
        m.load(anyString)(any[RequestHeader]) returns Future(hookResponse)
        m
      }

      override def urls: ComponentUrls = {
        val m = mock[ComponentUrls]
        m.cssUrl(anyString, any[Seq[Component]], any[Boolean]) returns Seq("url.css")
        m.jsUrl(anyString, any[Seq[Component]], any[Boolean]) returns Seq("url.js")
        m
      }

      override def components: Seq[Component] = Seq.empty

      override def mode: Mode = Mode.Dev

      override def renderer: ComponentEditorRenderer = mock[ComponentEditorRenderer]

      override def bundler: ComponentBundler = mock[ComponentBundler]

      override def assetPathProcessor: AssetPathProcessor = mock[AssetPathProcessor]

      override def pageSourceService: PageSourceService = mock[PageSourceService]
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
