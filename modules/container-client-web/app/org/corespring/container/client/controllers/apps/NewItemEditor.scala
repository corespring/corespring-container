package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.{ComponentBundler, ComponentJson}
import org.corespring.container.client.hooks.{DraftEditorHooks, EditorHooks, ItemEditorHooks}
import org.corespring.container.client.pages.engine.{DevEditorRenderer, EditorRenderer, MainEditorRenderer}
import org.corespring.container.client.views.models.ComponentsAndWidgets
import org.corespring.container.components.model.{Component, Interaction, Widget}
import play.api.Mode
import play.api.Mode.Mode
import play.api.libs.json.JsArray
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future


trait Components {
  def components: Seq[Component]

  def interactions: Seq[Interaction]

  def widgets: Seq[Widget]
}

private trait NewBaseEditor extends Controller {

  def mode: Mode

  def hooks: EditorHooks

  def bundler: ComponentBundler

  def renderer: EditorRenderer

  def componentJson: ComponentJson

  def components: Components

  def endpoints : Endpoints

  lazy val componentsAndWidgets = ComponentsAndWidgets(
    JsArray(components.interactions.map(componentJson.toJson)),
    JsArray(components.widgets.map(componentJson.toJson))
  )

  val debounceInMillis: Long = 5000

  def load(id: String) = Action.async { implicit request =>
    hooks.load(id).flatMap { e => e match {
      case Left(_) => Future.successful(BadRequest("?"))
      case Right(json) => {

        val prodMode: Boolean = request.getQueryString("mode")
          .map(_ == "prod")
          .getOrElse(mode == Mode.Prod)

        val clientOptions = EditorClientOptions(debounceInMillis, StaticPaths.staticPaths)
        val bundle = bundler.bundleAll().get
        val mainEndpoints = endpoints.main(id)
        val supportingMaterialsEndpoints = endpoints.supportingMaterials(id)
        renderer.render(mainEndpoints, supportingMaterialsEndpoints, componentsAndWidgets, clientOptions, bundle, prodMode).map { h =>
          Ok(h)
        }
      }
    }}
  }
}


class NewItemEditor(val mode: Mode,
                    val hooks: ItemEditorHooks,
                    val bundler: ComponentBundler,
                    val renderer: MainEditorRenderer,
                    val componentJson: ComponentJson,
                    val components: Components,
                    val endpoints:Endpoints = ItemEditorEndpoints) extends NewBaseEditor

class NewItemDevEditor(val mode: Mode,
                       val hooks: ItemEditorHooks,
                       val bundler: ComponentBundler,
                       val renderer: DevEditorRenderer,
                       val componentJson: ComponentJson,
                       val components: Components,
                       val endpoints : Endpoints = ItemEditorEndpoints) extends NewBaseEditor

class NewItemDraftEditor(val mode: Mode,
                    val hooks: DraftEditorHooks,
                    val bundler: ComponentBundler,
                    val renderer: MainEditorRenderer,
                    val componentJson: ComponentJson,
                    val components: Components,
                    val endpoints:Endpoints = DraftEditorEndpoints) extends NewBaseEditor

class NewItemDraftDevEditor(val mode: Mode,
                       val hooks: DraftEditorHooks,
                       val bundler: ComponentBundler,
                       val renderer: DevEditorRenderer,
                       val componentJson: ComponentJson,
                       val components: Components,
                       val endpoints : Endpoints = DraftEditorEndpoints) extends NewBaseEditor
