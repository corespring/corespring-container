package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.{ComponentBundler, ComponentJson, ItemComponentTypes}
import org.corespring.container.client.controllers.AssetsController
import org.corespring.container.client.controllers.apps.componentEditor.ComponentEditorLaunchingController
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks.{DraftEditorHooks, EditorHooks, ItemEditorHooks}
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.{ComponentEditorRenderer, DevEditorRenderer, EditorRenderer, MainEditorRenderer}
import org.corespring.container.client.views.models.ComponentsAndWidgets
import org.corespring.container.components.model.dependencies.ComponentSplitter
import org.corespring.container.components.model.{Component, Id, Interaction, Widget}
import play.api.Mode.Mode
import play.api.libs.json.{JsArray, JsValue, Json}
import play.api.mvc.{Action, Controller, RequestHeader, SimpleResult}
import play.api.{Logger, Mode}

import scala.concurrent.Future

trait ComponentService {
  def components: Seq[Component]

  def interactions: Seq[Interaction]

  def widgets: Seq[Widget]

  def idsInItem(json:JsValue) : Seq[Id]
}

class DefaultComponentService(mode: Mode, loadComps: => Seq[Component]) extends ComponentSplitter with ComponentService{

  private var loadedComponents: Seq[Component] = Seq.empty

  override def components: Seq[Component] = (mode, loadedComponents) match {
    case (Mode.Prod, Nil) => {
      loadedComponents = loadComps
      loadedComponents
    }
    case (Mode.Prod, x :: _) => loadedComponents
    case _ => loadComps
  }

  //superceding [[PlayerItemTypeReader]]
  override def idsInItem(json: JsValue): Seq[Id] = {
    ItemComponentTypes(interactions, widgets, layoutComponents, json).map(_.id)
  }
}

trait NewBaseEditor[H <: EditorHooks]
  extends Controller
  with AssetsController[EditorHooks]
  with ComponentEditorLaunchingController {

  def mode: Mode

  def hooks: H

  def bundler: ComponentBundler

  def renderer: EditorRenderer

  def componentEditorRenderer: ComponentEditorRenderer

  def componentJson: ComponentJson

  def componentService: ComponentService

  def endpoints: Endpoints

  def containerContext: ContainerExecutionContext

  implicit def ec = containerContext.context

  lazy val componentsAndWidgets = ComponentsAndWidgets(
    JsArray(componentService.interactions.map(componentJson.toJson)),
    JsArray(componentService.widgets.map(componentJson.toJson)))

  private lazy val logger = Logger(classOf[NewBaseEditor[H]])

  val debounceInMillis: Long = 5000

  def load(id: String) = Action.async { implicit request =>
    hooks.load(id).flatMap { e =>
      e match {
        case Left(_) => Future.successful(BadRequest("?"))
        case Right(json) => {

          val prodMode: Boolean = request.getQueryString("mode")
            .map(_ == "prod")
            .getOrElse(mode == Mode.Prod)

          val clientOptions = EditorClientOptions(debounceInMillis, StaticPaths.staticPaths)
          val bundle = bundler.bundleAll("editor", Some("editor"), !prodMode).get
          val mainEndpoints = endpoints.main(id)
          val supportingMaterialsEndpoints = endpoints.supportingMaterials(id)
          renderer.render(mainEndpoints, supportingMaterialsEndpoints, componentsAndWidgets, clientOptions, bundle, prodMode).map { h =>
            Ok(h)
          }
        }
      }
    }
  }

  def isProd(rh: RequestHeader) = rh.getQueryString("mode").map(_ == "prod").getOrElse(mode == Mode.Prod)

  private def onError(sm: StatusMessage)(implicit rh: RequestHeader) = {
    import org.corespring.container.client.views.html.error

    val showErrorInUi = isProd(rh)

    val (code, msg) = sm
    code match {
      case SEE_OTHER => SeeOther(msg)
      case _ => Status(code)(error.main(code, msg, showErrorInUi))
    }
  }

  final def findComponentType(json: JsValue): Option[String] = {
    (json \ "components" \\ "componentType").map(_.as[String]).headOption
  }

  def componentEditor(id: String) = Action.async { implicit request =>
    def loadEditor(json: JsValue): Future[SimpleResult] = {
      logger.trace(s"function=loadEditor, json=${Json.prettyPrint(json)}")
      findComponentType(json) match {
        case Some(ct) => componentEditorResult(ct, request)
        case _ => Future.successful(BadRequest("Can't find a component type"))
      }
    }

    for {
      e <- hooks.load(id)
      result <- e.fold(e => Future.successful(onError(e)), (json) => {
        loadEditor(json)
      })
    } yield result
  }
}

trait NewBaseItemEditor extends NewBaseEditor[ItemEditorHooks] {
  override def endpoints: Endpoints = ItemEditorEndpoints
}

trait NewBaseDraftEditor extends NewBaseEditor[DraftEditorHooks] {
  override def endpoints: Endpoints = DraftEditorEndpoints
}

class NewItemEditor(val mode: Mode,
  val hooks: ItemEditorHooks,
  val bundler: ComponentBundler,
  val renderer: MainEditorRenderer,
  val componentEditorRenderer: ComponentEditorRenderer,
  val componentJson: ComponentJson,
  val componentService: ComponentService,
  val containerContext: ContainerExecutionContext) extends NewBaseItemEditor

class NewItemDevEditor(val mode: Mode,
  val hooks: ItemEditorHooks,
  val bundler: ComponentBundler,
  val renderer: DevEditorRenderer,
  val componentEditorRenderer: ComponentEditorRenderer,
  val componentJson: ComponentJson,
  val componentService: ComponentService,
  val containerContext: ContainerExecutionContext) extends NewBaseItemEditor

class NewDraftEditor(val mode: Mode,
  val hooks: DraftEditorHooks,
  val bundler: ComponentBundler,
  val renderer: MainEditorRenderer,
  val componentEditorRenderer: ComponentEditorRenderer,
  val componentJson: ComponentJson,
  val componentService: ComponentService,
  val containerContext: ContainerExecutionContext) extends NewBaseDraftEditor

class NewDraftDevEditor(val mode: Mode,
  val hooks: DraftEditorHooks,
  val bundler: ComponentBundler,
  val renderer: DevEditorRenderer,
  val componentEditorRenderer: ComponentEditorRenderer,
  val componentJson: ComponentJson,
  val componentService: ComponentService,
  val containerContext: ContainerExecutionContext) extends NewBaseDraftEditor
