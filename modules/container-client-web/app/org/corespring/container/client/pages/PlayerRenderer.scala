package org.corespring.container.client.pages

import java.lang.Boolean

import org.corespring.container.client.{ V2PlayerConfig, VersionInfo }
import org.corespring.container.client.component.{ ComponentJson, ComponentsScriptBundle }
import org.corespring.container.client.controllers.apps.{ NgSourcePaths, PageSourceService, PlayerEndpoints, SourcePaths }
import org.corespring.container.client.controllers.helpers.PlayerXhtml
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.processing.PlayerItemPreProcessor
import play.api.Logger
import play.api.libs.json.{ JsObject, JsValue, Json }
import play.api.templates.Html

import scala.concurrent.{ ExecutionContext, Future }

class PlayerRenderer(
  playerConfig: V2PlayerConfig,
  containerContext: ContainerExecutionContext,
  jadeEngine: JadeEngine,
  val pageSourceService: PageSourceService,
  val assetPathProcessor: AssetPathProcessor,
  componentJson: ComponentJson,
  playerXhtml: PlayerXhtml,
  itemPreProcessor: PlayerItemPreProcessor,
  versionInfo: VersionInfo) extends CoreRenderer {

  implicit def ec: ExecutionContext = containerContext.context

  private lazy val logger = Logger(classOf[PlayerRenderer])

  override val name = "player"

  private def javaBoolean(b: Boolean): java.lang.Boolean = new java.lang.Boolean(b)

  lazy val controlsJsSrc: NgSourcePaths = pageSourceService.loadJs(s"player-controls")

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

  def render(
    sessionId: String,
    session: JsValue,
    item: JsValue,
    bundle: ComponentsScriptBundle,
    warnings: Seq[String],
    prodMode: scala.Boolean,
    showControls: scala.Boolean): Future[Html] = Future {
    logger.info(s"function=render, bundle=$bundle")

    val (js, css) = prepareJsCss(prodMode, bundle)
    val endpoints = PlayerEndpoints.session(sessionId)
    val queryParams = Json.obj()

    val (controlsJs, controlsNgModules): (Seq[String], Seq[String]) = (showControls, prodMode) match {
      case (true, true) => Seq(controlsJsSrc.dest) -> controlsJsSrc.ngModules
      case (true, false) => controlsJsSrc.src -> controlsJsSrc.ngModules
      case (_, _) => Nil -> Nil
    }

    val jsWithControls = js ++ controlsJs

    val inlineJs = PlayerServices("player-injected", endpoints, queryParams).toString

    val useNewRelicRumConfig = playerConfig.newRelicRumConfig.isDefined
    val newRelicRumConfig = playerConfig.newRelicRumConfig.getOrElse(Json.obj())

    val session: JsValue = Json.obj()
    val processedXhtml = processXhtml((item \ "xhtml").asOpt[String])
    val preprocessedItem = itemPreProcessor.preProcessItemForPlayer(item).as[JsObject] ++ Json.obj("xhtml" -> processedXhtml)
    val sessionJson = Json.obj("session" -> session, "item" -> preprocessedItem)

    val ngModules = Some("player-injected") ++ sources.js.ngModules ++ bundle.ngModules ++ controlsNgModules

    logger.trace(s"function=render, ngModules=$ngModules")

    val params: Map[String, Any] = Map(
      "appName" -> "player",
      "js" -> jsWithControls.toArray,
      "css" -> css.toArray,
      "showControls" -> javaBoolean(showControls),
      "useNewRelicRumConfig" -> javaBoolean(useNewRelicRumConfig),
      "newRelicRumConfig" -> Json.stringify(newRelicRumConfig),
      "warnings" -> Json.stringify(Json.arr(warnings)),
      "ngModules" -> jsArrayString(ngModules),
      "ngServiceLogic" -> inlineJs,
      "sessionJson" -> Json.stringify(sessionJson),
      "options" -> "{}",
      "versionInfo" -> Json.stringify(versionInfo.json))

    jadeEngine.renderJade("player", params)
  }

}
