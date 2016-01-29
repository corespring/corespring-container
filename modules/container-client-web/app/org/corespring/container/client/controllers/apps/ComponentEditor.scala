package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.ComponentUrls
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.views.txt.js.ComponentEditorServices
import org.corespring.container.components.model.Component
import play.api.Mode.Mode
import play.api.libs.json.{JsValue, JsArray, Json}
import play.api.mvc.{Controller, Action}

import scala.concurrent.{ExecutionContext, Future}

class ComponentEditor(
                       containerExecutionContext: ContainerExecutionContext,
                       val components: Seq[Component],
                       val mode:Mode,
                       val sourcePaths: SourcePathsService,
                       val urls:ComponentUrls
                     )
  extends Controller
    with Jade
    with ComponentScriptPrep
    with ComponentInfoJson{

  implicit val ec : ExecutionContext = containerExecutionContext.context

  def load(componentType:String) = Action.async{ request =>
    Future{

      val appContext = AppContext("editor", Some("singleComponentEditor"))
      val scriptInfo = componentScriptInfo(appContext, Seq(componentType), jsMode(request) == "dev")
      val domainResolvedJs = buildJs(scriptInfo)(request)
      val domainResolvedCss = buildCss(scriptInfo)(request)
      val jsSrcPaths = jsSrc(appContext)
      val arr : JsValue = JsArray(interactions.map(componentInfoToJson(modulePath, interactions, widgets)(_)))
      Ok(renderJade(
        EditorTemplateParams(
          "singleComponentEditor",
          domainResolvedJs,
          domainResolvedCss,
          jsSrcPaths.ngModules ++ scriptInfo.ngDependencies,
          ComponentEditorServices("singleComponentEditor.services", arr, componentType).toString,
          Json.obj(),
          EditorClientOptions(0, Json.obj())
        ))
      )
    }
    }

}
