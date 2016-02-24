package org.corespring.container.client.controllers.apps

import java.util.concurrent.TimeUnit

import org.corespring.container.client.component._
import org.corespring.container.client.hooks.EditorHooks
import org.corespring.container.client.pages.ComponentEditorRenderer
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.components.model.Component
import org.corespring.test.TestContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.Mode
import play.api.Mode.Mode
import play.api.libs.json.{ JsArray, JsObject, Json }
import play.api.mvc.{ Request, AnyContent, RequestHeader }
import play.api.templates.Html
import play.api.test.FakeRequest
import play.api.test.Helpers._

import scala.concurrent.duration.Duration
import scala.concurrent.{ Await, Future }

class CoreEditorTest extends Specification with Mockito {

  class scope extends Scope with CoreEditor with TestContext {

    override protected def buildJs(scriptInfo: ComponentScriptInfo, extras: Seq[String])(implicit rh: RequestHeader): Seq[String] = Seq.empty

    override protected def buildCss(scriptInfo: ComponentScriptInfo)(implicit rh: RequestHeader): Seq[String] = Seq.empty

    override def jsSrc(context: String): NgSourcePaths = NgSourcePaths(Seq.empty, "", Seq.empty, Seq.empty)
    override def cssSrc(context: String): CssSourcePaths = CssSourcePaths(Seq.empty, "", Seq.empty)

    implicit val r = FakeRequest("", "")
    override def versionInfo: JsObject = Json.obj()

    override def servicesJs(id: String, components: JsArray, widgets: JsArray): String = ""

    override def urls: ComponentUrls = {
      val m = mock[ComponentUrls]
      m
    }

    override def components: Seq[Component] = Seq.empty

    val mockHooks = {
      val m = mock[EditorHooks]
      m.load(any[String])(any[RequestHeader]) returns Future(Right(Json.obj()))
      m
    }

    override def hooks: EditorHooks = mockHooks

    override def mode: Mode = Mode.Dev

    protected var templateParams: TemplateParams = null

    override def renderJade(params: TemplateParams): Html = {
      templateParams = params
      Html("hi")
    }

    override def renderer: ComponentEditorRenderer = mock[ComponentEditorRenderer]

    override def bundler: ComponentBundler = mock[ComponentBundler]

    override def assetPathProcessor: AssetPathProcessor = mock[AssetPathProcessor]

    override def pageSourceService: PageSourceService = mock[PageSourceService]

    override def componentJson: ComponentJson = new ComponentInfoJson("path")
  }

  "load" should {

    "call hooks.load" in new scope {
      load("id")(r)
      there was one(hooks).load("id")(r)
    }

    "pass SEE_OTHER from hook" in new scope {
      mockHooks.load(any[String])(any[RequestHeader]) returns Future(Left(SEE_OTHER, "other"))
      val result = load("id")(r)
      status(result) === SEE_OTHER
    }

    "pass EditorTemplateParams.options.debounceInMillis to renderJade" in new scope {
      mockHooks.load(any[String])(any[RequestHeader]) returns Future(Right(Json.obj()))
      override def debounceInMillis = 5001
      Await.result(load("id")(r), Duration(1, TimeUnit.SECONDS))
      templateParams.asInstanceOf[EditorTemplateParams].options.debounceInMillis === 5001
    }
  }

  "componentEditor" should {

    trait componentEditor extends scope {

      override def componentEditorResult(componentType: String, request: Request[AnyContent]) = {
        Future.successful(Ok("<html></html>"))
      }

      hooks.load(any[String])(any[RequestHeader]) returns {
        Future.successful(Right(Json.obj("components" -> Json.obj(
          "singleComponent" -> Json.obj("componentType" -> "type")))))
      }
    }

    s"return $BAD_REQUEST if the component type can't be read from the json model" in new componentEditor {
      hooks.load(any[String])(any[RequestHeader]) returns {
        Future.successful(Right(Json.obj("components" -> Json.obj(
          "singleComponent" -> Json.obj()))))
      }
      val result = componentEditor("id")(r)
      status(result) must_== BAD_REQUEST
    }

    trait withError extends componentEditor {
      hooks.load(any[String])(any[RequestHeader]) returns {
        Future.successful(Left(402 -> "err"))
      }
    }

    s"return the error status code" in new withError {
      val result = componentEditor("id")(r)
      status(result) must_== 402
    }

    s"return the error body" in new withError {
      val result = componentEditor("id")(r)
      contentAsString(result) must_== org.corespring.container.client.views.html.error.main(402, "err", true).toString()
    }

    s"return $OK" in new componentEditor {
      val result = componentEditor("id")(r)
      status(result) must_== OK
    }

    s"return the html" in new componentEditor {
      val result = componentEditor("id")(r)
      contentAsString(result) must_== "<html></html>"
    }
  }
}
