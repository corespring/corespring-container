package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.controllers.helpers.JsonHelper
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.controllers.{ AssetsController, resources }
import org.corespring.container.client.hooks.Hooks._
import org.corespring.container.client.hooks._
import org.corespring.container.client.views.html.error
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.libs.json.{ Json, JsValue }
import play.api.mvc._

trait DevEditor
  extends AllItemTypesReader
  with App[EditorHooks]
  with JsonHelper
  with Jade
  with AssetsController[EditorHooks] {

  override def context: String = "dev-editor"

  import resources.{ routes => resourceRoutes }

  def servicesJs(draftId: String) = {
    EditorServices(
      "dev-editor.services",
      resourceRoutes.ItemDraft.load(draftId),
      resourceRoutes.ItemDraft.saveSubset(draftId, ":subset"),
      Json.obj(),
      Json.obj()).toString
  }

  def load(draftId: String): Action[AnyContent] = Action.async { implicit request =>
    def onError(sm: StatusMessage) = {
      val (code, msg) = sm
      code match {
        case SEE_OTHER => SeeOther(msg)
        case _ => Status(code)(error.main(code, msg, showErrorInUi))
      }
    }

    def onItem(i: JsValue): SimpleResult = {
      val scriptInfo = componentScriptInfo(componentTypes(i), jsMode == "dev")
      val domainResolvedJs = buildJs(scriptInfo)
      val domainResolvedCss = buildCss(scriptInfo)
      Ok(renderJade(
        DevEditorTemplateParams(
          context,
          domainResolvedJs,
          domainResolvedCss,
          jsSrc.ngModules ++ scriptInfo.ngDependencies,
          servicesJs(draftId))))
    }

    hooks.load(draftId).map { e => e.fold(onError, onItem) }
  }

}