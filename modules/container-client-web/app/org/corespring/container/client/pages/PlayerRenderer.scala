package org.corespring.container.client.pages

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.{ ComponentJson, ComponentsScriptBundle }
import org.corespring.container.client.controllers.apps.PageSourceService
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.client.views.txt.js.{ ComponentEditorServices, PlayerServices }
import play.api.Logger
import play.api.libs.json.{ JsArray, Json }
import play.api.templates.Html

import scala.concurrent.{ ExecutionContext, Future }

class PlayerRenderer(
  containerContext: ContainerExecutionContext,
  jadeEngine: JadeEngine,
  pageSourceService: PageSourceService,
  assetPathProcessor: AssetPathProcessor,
  componentJson: ComponentJson,
  versionInfo: VersionInfo) {

  implicit def ec: ExecutionContext = containerContext.context

  private lazy val logger = Logger(classOf[PlayerRenderer])

  def name = "player"

  private object sources {
    lazy val js = {
      pageSourceService.loadJs(name)
    }

    lazy val css = {
      pageSourceService.loadCss(name)
    }
  }

  def render(bundle: ComponentsScriptBundle, prodMode: Boolean): Future[Html] = Future {

    logger.info(s"function=render, bundle=$bundle")

    val css = if (prodMode) Seq(sources.css.dest) else sources.css.src
    val js = if (prodMode) Seq(sources.js.dest) else sources.js.src
    val inlineJs = PlayerServices("name", endpoints, queryParams).toString
    //arr, componentBundle.componentType).toString
    val processedCss = (css ++ bundle.css).map(assetPathProcessor.process)
    val processedJs = (sources.js.otherLibs ++ js ++ bundle.js).map(assetPathProcessor.process)
    val params: Map[String, Any] = Map(
      "appName" -> "player",
      "js" -> processedJs.toArray,
      "css" -> processedCss.toArray,
      "ngModules" -> (sources.js.ngModules ++ bundle.ngModules).map(s => s"'$s'").mkString(","),
      "ngServiceLogic" -> inlineJs,
      "options" -> "{}",
      "versionInfo" -> Json.stringify(versionInfo.json))

    jadeEngine.renderJade("player", params)
  }

}
