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
    with HasContainerContext{

  def loadComponentEditorHtml(componentType:String)(request:Request[AnyContent]) : Future[Html] =
    Future{
      val componentEditorOptions : ComponentEditorOptions = request.body.asFormUrlEncoded.map{ f =>
        val activePane = f.get("activePane").flatMap(_.headOption)
        val showNavigation : Option[Boolean] = f.get("showNavigation").map(_.exists(_ == "true"))
        val uploadUrl = f.get("uploadUrl").flatMap(_.headOption)
        val uploadMethod = f.get("uploadMethod").flatMap(_.headOption)
        ComponentEditorOptions(activePane, showNavigation, uploadUrl, uploadMethod)
      }.getOrElse(ComponentEditorOptions.empty)

      val appContext = AppContext("editor", Some("singleComponentEditor"))
      val scriptInfo = componentScriptInfo(appContext, Seq(componentType), jsMode(request) == "dev")
      val domainResolvedJs = buildJs(scriptInfo)(request)
      val domainResolvedCss = buildCss(scriptInfo)(request)
      val jsSrcPaths = jsSrc(appContext)
      val arr : JsValue = JsArray(interactions.map(componentInfoToJson(modulePath, interactions, widgets)(_)))
      renderJade(
        ComponentEditorTemplateParams(
          "singleComponentEditor",
          domainResolvedJs,
          domainResolvedCss,
          jsSrcPaths.ngModules ++ scriptInfo.ngDependencies,
          ComponentEditorServices("singleComponentEditor.services", arr, componentType).toString,
          obj(),
          componentEditorOptions))
    }
}

class ComponentEditor(val containerContext: ContainerExecutionContext,
                       val components: Seq[Component],
                       val mode:Mode,
                       val sourcePaths: SourcePathsService,
                       val urls:ComponentUrls)
  extends Controller
    with ComponentEditorLaunching
    with Jade
    with ComponentScriptPrep
    with ComponentInfoJson{

  def load(componentType:String) = Action.async{ request =>
    loadComponentEditorHtml(componentType)(request).map(Ok(_))
  }

}
