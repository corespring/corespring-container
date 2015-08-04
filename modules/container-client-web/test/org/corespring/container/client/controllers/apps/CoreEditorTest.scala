package org.corespring.container.client.controllers.apps

import java.util.concurrent.TimeUnit

import org.corespring.container.client.component.ComponentUrls
import org.corespring.container.client.hooks.EditorHooks
import org.corespring.container.components.model.{ Widget, Client, Component }
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.Mode
import play.api.Mode.Mode
import play.api.libs.json.{ Json, JsObject, JsArray }
import play.api.mvc.RequestHeader
import play.api.templates.Html
import play.api.test.FakeRequest

import scala.concurrent.duration.Duration
import scala.concurrent.{ Await, Future, ExecutionContext }
import play.api.test.Helpers._

class CoreEditorTest extends Specification with Mockito {

  class scope extends Scope with CoreEditor {

    override protected def buildJs(scriptInfo: ComponentScriptInfo, extras: Seq[String])(implicit rh: RequestHeader): Seq[String] = Seq.empty

    override protected def buildCss(scriptInfo: ComponentScriptInfo, withComponents: Boolean = false)(implicit rh: RequestHeader): Seq[String] = Seq.empty

    override protected def buildLess(scriptInfo: ComponentScriptInfo)(implicit rh: RequestHeader): Seq[String] = Seq.empty

    override def jsSrc: NgSourcePaths = NgSourcePaths(Seq.empty, "", Seq.empty, Seq.empty)
    override def cssSrc: CssSourcePaths = CssSourcePaths(Seq.empty, "", Seq.empty)

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

    override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global

    override def mode: Mode = Mode.Dev

    protected var templateParams: TemplateParams = null

    override def renderJade(params: TemplateParams): Html = {
      templateParams = params
      Html("hi")
    }

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

  "toJson" should {
    "convert ComponentInfo to json" in new scope {
      val componentInfo = Widget("org", "widget", None, None, Client("render", "configure", None, None), false, Json.obj(
        "external-configuration" -> Json.obj("config" -> "a")), Json.obj("data" -> "data"))
      val json = toJson(componentInfo)
      (json \ "name").as[String] === "widget"
      (json \ "released").as[Boolean] === false
      (json \ "componentType").as[String] === "org-widget"
      (json \ "defaultData").as[JsObject] === componentInfo.defaultData
      (json \ "configuration").as[JsObject] === componentInfo.packageInfo \ "external-configuration"
    }
  }
}
