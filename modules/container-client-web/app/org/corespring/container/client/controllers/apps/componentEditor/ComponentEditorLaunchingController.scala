package org.corespring.container.client.controllers.apps.componentEditor

import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.component.ComponentBundler
import org.corespring.container.client.pages.ComponentEditorRenderer
import play.api.Logger
import play.api.mvc.{ AnyContent, Request, SimpleResult }

import scala.concurrent.Future

trait ComponentEditorLaunchingController extends HasContainerContext {

  import play.api.mvc.Results._

  def renderer: ComponentEditorRenderer
  def bundler: ComponentBundler

  private lazy val logger = Logger(classOf[ComponentEditorLaunchingController])

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
