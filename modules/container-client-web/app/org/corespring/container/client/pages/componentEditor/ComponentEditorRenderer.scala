package org.corespring.container.client.pages.componentEditor

import org.corespring.container.client.controllers.apps.PageSourceService
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.views.txt.js.ComponentEditorServices
import play.api.Logger
import play.api.libs.json.Json
import play.api.templates.Html

import scala.concurrent.Future

class ComponentEditorRenderer(
  containerExecutionContext: ContainerExecutionContext,
  jade: JadeEngine,
  pageSourceService: PageSourceService) {

  private val logger = Logger(classOf[ComponentEditorRenderer])

  implicit def ec = containerExecutionContext.context

  private object sources {
    lazy val js = {
      pageSourceService.loadJs("singleComponentEditor")
    }

    lazy val css = {
      pageSourceService.loadCss("singleComponentEditor")
    }
  }

  def render(prodMode: Boolean = false): Future[Html] = Future {

    val css = if (prodMode) Seq(sources.css.dest) else sources.css.src
    val js = if (prodMode) Seq(sources.js.dest) else sources.js.src

    val componentType = "corespring-multiple-choice"
    val arr = Json.arr()
    val inlineJs = ComponentEditorServices("corespring-singleComponentEditor.services", arr, componentType).toString
    val params: Map[String, Any] = Map(
      "appName" -> "singleComponentEditor",
      "css" -> css.toArray,
      "js" -> (sources.js.otherLibs ++ js).toArray,
      "ngModules" -> sources.js.ngModules.map(s => s"'$s'").mkString(","),
      "ngServiceLogic" -> inlineJs,
      "componentNgModules" -> "",
      "options" -> "{}",
      "versionInfo" -> "{}")

    logger.info(s"function=render, params=$params")

    jade.renderJade("singleComponentEditor", params)
  }
}
