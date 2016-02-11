package org.corespring.container.client.controllers.apps

import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.component.ComponentUrls
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.views.txt.js.ComponentEditorServices
import org.corespring.container.components.model.Component
import play.api.Mode.Mode
import play.api.libs.json.Json._
import play.api.libs.json.{JsArray, JsValue}
import play.api.mvc._
import play.api.templates.Html

import scala.concurrent.Future

trait ComponentEditorLaunching
  extends Jade
    with ComponentScriptPrep
    with ComponentInfoJson
    with HasContainerContext {


  private def loadComponentEditorHtml(reqToOptions: Request[AnyContent] => Option[(String, ComponentEditorOptions)])(componentType: String, req: Request[AnyContent]): Future[Html] = Future {
    val (previewMode, options) = reqToOptions(req).getOrElse("tabs" -> ComponentEditorOptions.default)
    logger.debug(s"function=loadComponentEditorHtml, componentEditorOptions=$options")
    val context = "singleComponentEditor"
    val scriptInfo = componentScriptInfo(context, Seq(componentType), jsMode(req) == "dev")
    val domainResolvedJs = buildJs(scriptInfo)(req)
    val domainResolvedCss = buildCss(scriptInfo)(req)
    val jsSrcPaths = jsSrc(context)
    val arr: JsValue = JsArray(interactions.map(componentInfoToJson(modulePath, interactions, widgets)(_)))
    renderJade(
      ComponentEditorTemplateParams(
        context,
        domainResolvedJs,
        domainResolvedCss,
        jsSrcPaths.ngModules ++ scriptInfo.ngDependencies,
        ComponentEditorServices("singleComponentEditor.services", arr, componentType).toString,
        obj(),
        options,
        previewMode))
  }

  def loadComponentEditorHtmlFromForm(componentType: String)(request: Request[AnyContent]): Future[Html] = {
    loadComponentEditorHtml(formToOptions)(componentType, request)
  }

  private def formToOptions(request: Request[AnyContent]): Option[(String, ComponentEditorOptions)] = {
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
    }
  }
}

class ComponentEditor(val containerContext: ContainerExecutionContext,
                      val components: Seq[Component],
                      val mode: Mode,
                      val sourcePaths: SourcePathsService,
                      val urls: ComponentUrls)
  extends Controller
    with ComponentEditorLaunching
    with Jade
    with ComponentScriptPrep
    with ComponentInfoJson {

  def load(componentType: String) = Action.async { request =>
    loadComponentEditorHtmlFromForm(componentType)(request).map(Ok(_))
  }

}
