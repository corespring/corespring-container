package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.ComponentBundler
import org.corespring.container.client.controllers.GetAsset
import org.corespring.container.client.hooks.CatalogHooks
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.CatalogRenderer
import play.api.{ Logger, Mode }
import play.api.Mode.Mode
import play.api.mvc.{ Action, AnyContent, Controller }

import scala.concurrent.Future

class Catalog(
  mode: Mode,
  val hooks: CatalogHooks,
  catalogRenderer: CatalogRenderer,
  bundler: ComponentBundler,
  val containerContext: ContainerExecutionContext) extends Controller with GetAsset[CatalogHooks] {

  private lazy val logger = Logger(classOf[Catalog])

  private lazy val endpoints = ItemEditorEndpoints

  def load(id: String): Action[AnyContent] = Action.async {
    implicit request =>
      hooks.showCatalog(id).flatMap { e =>
        val prodMode = request.getQueryString("mode").map(_ == "prod").getOrElse(mode == Mode.Prod)

        bundler.bundleAll("catalog", Some("editor"), !prodMode) match {
          case Some(b) => {
            val mainEndpoints = endpoints.main(id)
            val supportingMaterialsEndpoints = endpoints.supportingMaterials(id)
            catalogRenderer.render(b, mainEndpoints, supportingMaterialsEndpoints, prodMode).map { html =>
              Ok(html)
            }
          }
          case _ => Future.successful(BadRequest("Failed to build bundle"))
        }
      }
  }
}
