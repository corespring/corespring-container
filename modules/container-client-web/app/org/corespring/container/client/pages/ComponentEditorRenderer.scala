package org.corespring.container.client.pages

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.{ComponentJson, SingleComponentScriptBundle}
import org.corespring.container.client.controllers.apps.{ComponentEditorOptions, PageSourceService, PreviewRightComponentEditorOptions}
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.client.views.txt.js.ComponentEditorServices
import play.api.Logger
import play.api.libs.json.{JsArray, JsValue, Json}
import play.api.templates.Html

import scala.concurrent.Future

class ComponentEditorRenderer(
  containerExecutionContext: ContainerExecutionContext,
  jade: JadeEngine,
  pageSourceService: PageSourceService,
  componentJson: ComponentJson,
  assetPathProcessor: AssetPathProcessor,
  versionInfo: VersionInfo) {

  private val logger = Logger(classOf[ComponentEditorRenderer])

  private val name = "singleComponentEditor"

  implicit def ec = containerExecutionContext.context

  private object sources {
    lazy val js = {
      pageSourceService.loadJs(name)
    }

    lazy val css = {
      pageSourceService.loadCss(name)
    }
  }

  def render(componentBundle: SingleComponentScriptBundle, previewMode: String, clientOptions: ComponentEditorOptions, prodMode: Boolean): Future[Html] = Future {

    logger.info(s"function=render, componentBundle=$componentBundle")

    val css = if (prodMode) Seq(sources.css.dest) else sources.css.src
    val js = if (prodMode) Seq(sources.js.dest) else sources.js.src
    val arr: JsArray = JsArray(Seq(componentBundle.component).map(componentJson.toJson(_)))
    val inlineJs = ComponentEditorServices(s"corespring-$name.services", arr, componentBundle.componentType).toString

    val processedCss = (css ++ componentBundle.css).map(assetPathProcessor.process)
    val processedJs = (sources.js.otherLibs ++ js ++ componentBundle.js).map(assetPathProcessor.process)

    val previewWidth = if (clientOptions.isInstanceOf[PreviewRightComponentEditorOptions]) {
      clientOptions.asInstanceOf[PreviewRightComponentEditorOptions].previewWidth
    } else None

    val params: Map[String, Any] = Map(
      "appName" -> name,
      "previewMode" -> previewMode,
      //Note: calling down to a java api so null is ok
      "previewWidth" -> previewWidth.getOrElse(null),
      "css" -> processedCss.toArray,
      "js" -> processedJs.toArray,
      "ngModules" -> (sources.js.ngModules ++ componentBundle.ngModules).map(s => s"'$s'").mkString(","),
      "ngServiceLogic" -> inlineJs,
      "componentNgModules" -> "",
      "options" -> Json.stringify(clientOptions.toJson),
      "versionInfo" -> Json.stringify(versionInfo.json))

    logger.info(s"function=render, params=$params")

    jade.renderJade("singleComponentEditor", params)
  }
}
