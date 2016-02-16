package org.corespring.container.client.controllers.apps

import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.component.ComponentBundler
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.componentEditor.ComponentEditorRenderer
import play.api.Logger
import play.api.mvc._

import scala.concurrent.Future

private[controllers] object FormToOptions {
  def apply(request: Request[AnyContent]): (String, ComponentEditorOptions) = {
    request.body.asFormUrlEncoded.map { f =>
      val previewMode = f.get("previewMode").flatMap(_.headOption).find(m => m == "tabs" || m == "preview-right").getOrElse("tabs")

      val uploadUrl = f.get("uploadUrl").flatMap(_.headOption)
      val uploadMethod = f.get("uploadMethod").flatMap(_.headOption)

      val options = if (previewMode == "preview-right") {
        val showPreview: Option[Boolean] = f.get("showPreview").map(_.exists(_ == "true"))
        PreviewRightComponentEditorOptions(showPreview, uploadUrl, uploadMethod)
      } else {
        val activePane = f.get("activePane").flatMap(_.headOption)
        val showNavigation: Option[Boolean] = f.get("showNavigation").map(_.exists(_ == "true"))
        TabComponentEditorOptions(activePane, showNavigation, uploadUrl, uploadMethod)
      }
      previewMode -> options
    }.getOrElse("tabs" -> ComponentEditorOptions.default)
  }
}

trait ComponentEditorLaunchingController extends HasContainerContext {

  import play.api.mvc.Results._

  def renderer: ComponentEditorRenderer
  def bundler: ComponentBundler

  private lazy val logger = Logger(classOf[ComponentEditorController])

  def componentEditorResult(componentType: String, request: Request[AnyContent]): Future[SimpleResult] = {
    val (previewMode, options) = FormToOptions(request)
    val expandPaths = request.getQueryString("mode") == Some("dev")
    logger.info(s"function=load, componentType=$componentType, expandPaths=$expandPaths")

    bundler.singleBundle(componentType, "editor", expandPaths) match {
      case Some(b) => renderer.render(b, previewMode, options, expandPaths).map(Ok(_))
      case None => Future.successful(NotFound(""))
    }
  }
}

class ComponentEditorController(
  val containerContext: ContainerExecutionContext,
  val renderer: ComponentEditorRenderer,
  val bundler: ComponentBundler) extends Controller with ComponentEditorLaunchingController {

  def load(componentType: String) = Action.async { request => componentEditorResult(componentType, request) }
}
