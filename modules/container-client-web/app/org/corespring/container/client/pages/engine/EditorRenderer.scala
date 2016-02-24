package org.corespring.container.client.pages.engine

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.{ComponentJson, ComponentsScriptBundle}
import org.corespring.container.client.controllers.apps.{EditorClientOptions, PageSourceService}
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.client.views.models.{ComponentsAndWidgets, MainEndpoints, SupportingMaterialsEndpoints}
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.libs.json.{JsArray, JsValue, Json}
import play.api.templates.Html

import scala.concurrent.Future

trait EditorRenderer{

  def containerExecutionContext: ContainerExecutionContext
     def jade: JadeEngine
                               def pageSourceService: PageSourceService
                               def assetPathProcessor: AssetPathProcessor
                               def componentJson: ComponentJson
                               def versionInfo: VersionInfo

  def name:String

  implicit def ec = containerExecutionContext.context

  private object sources {
    lazy val js = {
      pageSourceService.loadJs(name)
    }

    lazy val css = {
      pageSourceService.loadCss(name)
    }
  }

  def render( mainEndpoints: MainEndpoints,
              supportingMaterialsEndpoints: SupportingMaterialsEndpoints,
              componentsAndWidgets: ComponentsAndWidgets,
              clientOptions : EditorClientOptions,
              bundle:ComponentsScriptBundle,
              prodMode : Boolean) : Future[Html] = Future{
    val css = if (prodMode) Seq(sources.css.dest) else sources.css.src
    val js = if (prodMode) Seq(sources.js.dest) else sources.js.src
    val processedCss = (css ++ bundle.css).map(assetPathProcessor.process)
    val processedJs = (sources.js.otherLibs ++ js ++ bundle.js).map(assetPathProcessor.process)

    val serverNgModuleName = s"$name.serverInjectedServices"

    val servicesJs = EditorServices(serverNgModuleName, mainEndpoints, supportingMaterialsEndpoints, componentsAndWidgets)

    val params : Map[String,Any] = Map(
      "appName" -> name,
      "js" -> processedJs.toArray,
      "css" -> processedCss.toArray,
      "ngModules" -> (Seq(serverNgModuleName) ++ sources.js.ngModules ++ bundle.ngModules).map(s => s"'$s'").mkString(","),
      "ngServiceLogic" -> servicesJs,
      "versionInfo" -> Json.stringify(versionInfo.json),
      "options" -> Json.stringify(clientOptions.toJson))
    jade.renderJade("editor", params)
  }
}

class MainEditorRenderer(val containerExecutionContext: ContainerExecutionContext,
                         val jade: JadeEngine,
                         val pageSourceService: PageSourceService,
                         val assetPathProcessor: AssetPathProcessor,
                         val componentJson: ComponentJson,
                         val versionInfo: VersionInfo) extends EditorRenderer{
  override def name: String = "editor"
}

class DevEditorRenderer(val containerExecutionContext: ContainerExecutionContext,
                        val jade: JadeEngine,
                        val pageSourceService: PageSourceService,
                        val assetPathProcessor: AssetPathProcessor,
                        val componentJson: ComponentJson,
                        val versionInfo: VersionInfo) extends EditorRenderer{
  override def name: String = "devEditor"
}


