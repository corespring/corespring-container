package org.corespring.container.client.pages

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.{ ComponentJson, ComponentsScriptBundle }
import org.corespring.container.client.controllers.apps.{ EditorClientOptions, PageSourceService }
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.client.views.models.{ ComponentsAndWidgets, MainEndpoints, SupportingMaterialsEndpoints }
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.Logger
import play.api.libs.json.Json
import play.api.templates.Html

import scala.concurrent.Future

trait EditorRenderer extends CoreRenderer {

  private lazy val logger = Logger(classOf[EditorRenderer])

  def containerExecutionContext: ContainerExecutionContext
  def jade: JadeEngine
  def assetPathProcessor: AssetPathProcessor
  def componentJson: ComponentJson
  def versionInfo: VersionInfo

  implicit def ec = containerExecutionContext.context

  def render(mainEndpoints: MainEndpoints,
    supportingMaterialsEndpoints: SupportingMaterialsEndpoints,
    componentsAndWidgets: ComponentsAndWidgets,
    clientOptions: EditorClientOptions,
    bundle: ComponentsScriptBundle,
    prodMode: Boolean): Future[Html] = Future {

    val (js, css) = prepareJsCss(prodMode, bundle)

    val serverNgModuleName = s"$name.serverInjectedServices"

    val servicesJs = EditorServices(serverNgModuleName, mainEndpoints, supportingMaterialsEndpoints, componentsAndWidgets)

    val ngModules = jsArrayString(Seq(serverNgModuleName) ++ sources.js.ngModules ++ bundle.ngModules ++ sources.js.ngConfigModules)

    logger.debug(s"function=render, name=$name, ngModules=$ngModules")

    val params: Map[String, Any] = Map(
      "appName" -> name,
      "js" -> js.toArray,
      "css" -> css.toArray,
      "ngModules" -> ngModules,
      "ngServiceLogic" -> servicesJs,
      "versionInfo" -> Json.stringify(versionInfo.json),
      "options" -> Json.stringify(clientOptions.toJson))
    jade.renderJade(name, params)
  }
}

class MainEditorRenderer(val containerExecutionContext: ContainerExecutionContext,
  val jade: JadeEngine,
  val pageSourceService: PageSourceService,
  val assetPathProcessor: AssetPathProcessor,
  val componentJson: ComponentJson,
  val versionInfo: VersionInfo) extends EditorRenderer {
  override def name: String = "editor"
}

class DevEditorRenderer(val containerExecutionContext: ContainerExecutionContext,
  val jade: JadeEngine,
  val pageSourceService: PageSourceService,
  val assetPathProcessor: AssetPathProcessor,
  val componentJson: ComponentJson,
  val versionInfo: VersionInfo) extends EditorRenderer {
  override def name: String = "dev-editor"
}

