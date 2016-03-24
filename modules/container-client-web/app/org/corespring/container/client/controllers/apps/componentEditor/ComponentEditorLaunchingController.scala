package org.corespring.container.client.controllers.apps.componentEditor

import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.component.ComponentBundler
import org.corespring.container.client.controllers.apps.QueryStringHelper
import org.corespring.container.client.pages.ComponentEditorRenderer
import play.api.{Logger, Mode}
import play.api.Mode.Mode
import play.api.mvc.{AnyContent, Request, SimpleResult}

import scala.concurrent.Future

trait ComponentEditorLaunchingController
  extends HasContainerContext
  with QueryStringHelper{

  import play.api.mvc.Results._

  def componentEditorRenderer: ComponentEditorRenderer
  def bundler: ComponentBundler

  def mode : Mode

  private lazy val logger = Logger(classOf[ComponentEditorLaunchingController])

  def componentEditorResult(componentType: String, request: Request[AnyContent]): Future[SimpleResult] = {
    val (previewMode, options) = FormToOptions(request)

    val prodMode = request.getQueryString("mode").map{ m =>
      m == "prod"
    }.getOrElse(mode == Mode.Prod)

    logger.info(s"function=load, componentType=$componentType, prodMode=$prodMode")

    bundler.singleBundle(componentType, "editor", !prodMode) match {
      case Some(b) => {
        val queryParams = mkQueryParams(m => m)(request)
        componentEditorRenderer.render(b, previewMode, options, queryParams, prodMode).map(Ok(_))
      }
      case None => Future.successful(NotFound(""))
    }
  }
}
