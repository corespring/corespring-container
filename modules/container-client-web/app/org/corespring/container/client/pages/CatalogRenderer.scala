package org.corespring.container.client.pages

import org.corespring.container.client.component.{ComponentJson, ComponentsScriptBundle}
import org.corespring.container.client.controllers.apps.{PageSourceService, StaticPaths}
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.client.views.models.{MainEndpoints, SupportingMaterialsEndpoints}
import org.corespring.container.client.views.txt.js.CatalogServices
import org.corespring.container.components.services.ComponentService
import play.api.libs.json.Json
import play.api.templates.Html

import scala.concurrent.Future

class CatalogRenderer(jadeEngine: JadeEngine,
  containerContext: ContainerExecutionContext,
  val pageSourceService: PageSourceService,
  componentJson: ComponentJson,
  componentService: ComponentService,
                      val assetPathProcessor: AssetPathProcessor) extends CoreRenderer {

  implicit def ec = containerContext.context

  override val name = "catalog"

  def render(bundle: ComponentsScriptBundle,
    mainEndpoints: MainEndpoints,
    supportingMaterialsEndpoints: SupportingMaterialsEndpoints,
    prodMode: Boolean): Future[Html] = Future {

    val (js, css) = prepareJsCss(prodMode, bundle)

    val componentSet = Json.arr(componentService.interactions.map(componentJson.toJson))
    val ngServiceLogic = CatalogServices(s"$name-injected", componentSet, mainEndpoints, supportingMaterialsEndpoints).toString

    val params: Map[String, Any] = Map(
      "appName" -> name,
      "js" -> js.toArray,
      "css" -> css.toArray,
      "ngModules" -> jsArrayString(Some(s"$name-injected") ++ sources.js.ngModules ++ bundle.ngModules ++ sources.js.ngConfigModules),
      "ngServiceLogic" -> ngServiceLogic,
      "staticPaths" -> Json.stringify(StaticPaths.staticPaths))
    jadeEngine.renderJade(name, params)
  }
}
