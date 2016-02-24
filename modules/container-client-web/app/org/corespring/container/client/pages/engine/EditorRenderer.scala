package org.corespring.container.client.pages.engine

import org.corespring.container.client.component.{ComponentJson, ComponentsScriptBundle}
import org.corespring.container.client.controllers.apps.{EditorClientOptions, PageSourceService}
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.processing.AssetPathProcessor
import play.api.libs.json.{Json, JsArray, JsValue}
import play.api.templates.Html

import scala.concurrent.Future

class EditorRenderer(containerExecutionContext: ContainerExecutionContext,
                               jade: JadeEngine,
                               pageSourceService: PageSourceService,
                               assetPathProcessor: AssetPathProcessor,
                               componentJson: ComponentJson,
                               versionInfo: JsValue) {

  val name = "editor"

  implicit def ec = containerExecutionContext.context

  private object sources {
    lazy val js = {
      pageSourceService.loadJs(name)
    }

    lazy val css = {
      pageSourceService.loadCss(name)
    }
  }

  def render(servicesJs:String, clientOptions : EditorClientOptions, bundle:ComponentsScriptBundle, prodMode : Boolean) : Future[Html] = Future{
    val css = if (prodMode) Seq(sources.css.dest) else sources.css.src
    val js = if (prodMode) Seq(sources.js.dest) else sources.js.src
    val processedCss = (css ++ bundle.css).map(assetPathProcessor.process)
    val processedJs = (sources.js.otherLibs ++ js ++ bundle.js).map(assetPathProcessor.process)

    val params : Map[String,Any] = Map(
      "appName" -> name,
      "js" -> processedJs.toArray,
      "css" -> processedCss.toArray,
      "ngModules" -> (sources.js.ngModules ++ bundle.ngModules).map(s => s"'$s'").mkString(","),
      "ngServiceLogic" -> servicesJs,
      "versionInfo" -> Json.stringify(versionInfo),
      "options" -> clientOptions
    )
    jade.renderJade("editor", params)
  }

}


