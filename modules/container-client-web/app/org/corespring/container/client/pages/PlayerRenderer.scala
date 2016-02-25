package org.corespring.container.client.pages

import java.lang.Boolean

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.{ComponentJson, ComponentsScriptBundle}
import org.corespring.container.client.controllers.apps.{PageSourceService, PlayerEndpoints, SourcePaths}
import org.corespring.container.client.controllers.helpers.PlayerXhtml
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.processing.PlayerItemPreProcessor
import play.api.Logger
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.templates.Html

import scala.concurrent.{ExecutionContext, Future}

class PlayerRenderer(
  containerContext: ContainerExecutionContext,
  jadeEngine: JadeEngine,
  pageSourceService: PageSourceService,
  assetPathProcessor: AssetPathProcessor,
  componentJson: ComponentJson,
  playerXhtml: PlayerXhtml,
  itemPreProcessor: PlayerItemPreProcessor,
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

  private def javaBoolean(b: Boolean): java.lang.Boolean = new java.lang.Boolean(b)

  lazy val controlsJsSrc: SourcePaths = pageSourceService.loadJs(s"player-controls")

  /**
   * Preprocess the xml so that it'll work in all browsers
   * aka: convert tagNames -> attributes for ie 8 support
   * TODO: A layout component may have multiple elements
   * So we need a way to get all potential component names from
   * each component, not just assume its the top level.
   */
  private def processXhtml(maybeXhtml: Option[String]) = maybeXhtml.map {
    xhtml =>
      playerXhtml.processXhtml(xhtml)
  }.getOrElse("<div><h1>New Item</h1></div>")

  def render(sessionId: String, session: JsValue, item: JsValue, bundle: ComponentsScriptBundle, prodMode: scala.Boolean): Future[Html] = Future {
    logger.info(s"function=render, bundle=$bundle")
    val css = if (prodMode) Seq(sources.css.dest) else sources.css.src
    val js = if (prodMode) Seq(sources.js.dest) else sources.js.src
    val endpoints = PlayerEndpoints.session(sessionId)
    val queryParams = Json.obj()
    val showControls: scala.Boolean = true

    val controlsJs: Seq[String] = (showControls, prodMode) match {
      case (true, true) => Seq(controlsJsSrc.dest)
      case (true, false) => controlsJsSrc.src
      case (_, _) => Nil
    }

    val inlineJs = PlayerServices("player-injected", endpoints, queryParams).toString
    val processedCss = (css ++ bundle.css).map(assetPathProcessor.process)
    val processedJs = (sources.js.otherLibs ++ js ++ controlsJs ++ bundle.js).map(assetPathProcessor.process)
    val useNewRelicRumConfig = true
    val newRelicRumConfig = Json.obj()
    val hasBeenArchived = false
    val warnings: Seq[String] = if (hasBeenArchived) {
      Seq("Warning: This item has been deleted")
    } else {
      Nil
    }

    val session: JsValue = Json.obj()
    val processedXhtml = processXhtml((item \ "xhtml").asOpt[String])
    val preprocessedItem = itemPreProcessor.preProcessItemForPlayer(item).as[JsObject] ++ Json.obj("xhtml" -> processedXhtml)
    val sessionJson = Json.obj("session" -> session, "item" -> preprocessedItem)

    val params: Map[String, Any] = Map(
      "appName" -> "player",
      "js" -> processedJs.toArray,
      "css" -> processedCss.toArray,
      "showControls" -> javaBoolean(showControls),
      "useNewRelicRumConfig" -> javaBoolean(useNewRelicRumConfig),
      "newRelicRumConfig" -> Json.stringify(newRelicRumConfig),
      "warnings" -> Json.stringify(Json.arr(warnings)),
      "ngModules" -> (Some("player-injected") ++ sources.js.ngModules ++ bundle.ngModules).map(s => s"'$s'").mkString(","),
      "ngServiceLogic" -> inlineJs,
      "sessionJson" -> Json.stringify(sessionJson),
      "options" -> "{}",
      "versionInfo" -> Json.stringify(versionInfo.json))

    jadeEngine.renderJade("player", params)
  }

}
