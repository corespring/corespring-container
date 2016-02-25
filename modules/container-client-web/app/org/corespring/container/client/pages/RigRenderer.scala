package org.corespring.container.client.pages

import org.corespring.container.client.component.SingleComponentScriptBundle
import org.corespring.container.client.controllers.apps.PageSourceService
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import play.api.libs.json.{ JsValue, Json }
import play.api.templates.Html

import scala.concurrent.Future

class RigRenderer(pageSourceService: PageSourceService,
  containerContext: ContainerExecutionContext,
  jadeEngine: JadeEngine) {

  implicit def ec = containerContext.context

  def name = "rig"

  private object sources {
    lazy val js = {
      pageSourceService.loadJs(name)
    }

    lazy val css = {
      pageSourceService.loadCss(name)
    }
  }

  def render(item: JsValue, bundle: SingleComponentScriptBundle): Future[Html] = Future {

    val js = sources.js.src ++ sources.js.otherLibs ++ bundle.js
    val css = sources.css.src ++ bundle.css

    val params: Map[String, Any] = Map(
      "appName" -> "rig",
      "js" -> js.toArray,
      "css" -> css.toArray,
      "ngModules" -> (sources.js.ngModules ++ bundle.ngModules).map(s => s"'$s'").mkString(","),
      "ngServiceLogic" -> "",
      "itemJson" -> Json.prettyPrint(item))
    jadeEngine.renderJade("rig", params)
  }
}
