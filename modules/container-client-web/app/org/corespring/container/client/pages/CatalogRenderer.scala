package org.corespring.container.client.pages

import org.corespring.container.client.component.{ComponentJson, ComponentsScriptBundle}
import org.corespring.container.client.controllers.apps.{ComponentService, PageSourceService, StaticPaths}
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.client.views.models.{MainEndpoints, SupportingMaterialsEndpoints}
import org.corespring.container.client.views.txt.js.CatalogServices
import play.api.libs.json.Json
import play.api.templates.Html

import scala.concurrent.Future

class CatalogRenderer(jadeEngine: JadeEngine,
                      containerContext:ContainerExecutionContext,
                      pageSourceService: PageSourceService,
                      componentJson : ComponentJson,
                      componentService : ComponentService,
                      assetPathProcessor: AssetPathProcessor) {


  implicit def ec = containerContext.context

  private val name = "catalog"

  private object sources {
    lazy val js = {
      pageSourceService.loadJs(name)
    }

    lazy val css = {
      pageSourceService.loadCss(name)
    }
  }

  def render( bundle: ComponentsScriptBundle,
              mainEndpoints:MainEndpoints,
              supportingMaterialsEndpoints: SupportingMaterialsEndpoints,
              prodMode:Boolean) : Future[Html] = Future{


    val css = if (prodMode) Seq(sources.css.dest) else sources.css.src
    val js = if (prodMode) Seq(sources.js.dest) else sources.js.src
    val processedCss = (css ++ bundle.css).map(assetPathProcessor.process)
    val processedJs = (sources.js.otherLibs ++ js ++ bundle.js).map(assetPathProcessor.process)

    val componentSet = Json.arr(componentService.interactions.map(componentJson.toJson))
    val ngServiceLogic = CatalogServices(s"$name-injected", componentSet, mainEndpoints, supportingMaterialsEndpoints).toString

    val params : Map[String,Any] = Map(
      "appName" -> name,
      "js" -> processedJs.toArray,
      "css" -> processedCss.toArray,
      "ngModules" -> (Some(s"$name-injected") ++ sources.js.ngModules ++ bundle.ngModules).map(s => s"'$s'").mkString(","),
      "ngServiceLogic" -> ngServiceLogic,
      "staticPaths" -> Json.stringify(StaticPaths.staticPaths))
    jadeEngine.renderJade(name, params)
  }
}
