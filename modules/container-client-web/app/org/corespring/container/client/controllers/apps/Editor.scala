package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.controllers.helpers.JsonHelper
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.EditorHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.views.txt.js.EditorServices
import org.corespring.container.components.model.ComponentInfo
import play.api.libs.json._
import play.api.mvc.{Action, AnyContent, SimpleResult}

trait Editor
  extends AllItemTypesReader
  with App[EditorHooks]
  with JsonHelper
  with Jade{

  import org.corespring.container.client.controllers.resources.{routes => resourceRoutes}
  import org.corespring.container.client.controllers.apps.{routes => appRoutes}


  override def context: String = "editor"

  private def toJson(ci: ComponentInfo): JsValue = {
    val tag = tagName(ci.id.org, ci.id.name)
    partialObj(
      "name" -> Some(JsString(ci.id.name)),
      "title" -> Some(JsString(ci.title.getOrElse(""))),
      "titleGroup" -> Some(JsString(ci.titleGroup.getOrElse(""))),
      "icon" -> ((interactions ++ widgets).find(_.componentType == tag).map(_.icon) match {
        case Some(iconBytes) => iconBytes match {
          case Some(thing) => Some(JsString(s"$modulePath/icon/$tag"))
          case _ => None
        }
        case _ => None
      }),
      "componentType" -> Some(JsString(tag)),
      "defaultData" -> Some(ci.defaultData),
      "configuration" -> (ci.packageInfo \ "external-configuration").asOpt[JsObject])
  }

  override val servicesJs = {

    val componentJson: Seq[JsValue] = interactions.map(toJson)
    val widgetJson: Seq[JsValue] = widgets.map(toJson)

    EditorServices(
      "editor.services",
      resourceRoutes.Item.load(":id"),
      resourceRoutes.Item.save(":id"),
      JsArray(componentJson),
      JsArray(widgetJson)).toString
  }

  override def load(itemId: String): Action[AnyContent] = Action.async { implicit request =>

    import org.corespring.container.client.views.html.error

    def onError(sm: StatusMessage) = {
      val (code, msg) = sm
      code match {
        case SEE_OTHER => SeeOther(msg)
        case _ => Status(code)(error.main(code, msg, showErrorInUi))
      }
    }

    def onItem(i: JsValue): SimpleResult = {
      val scriptInfo = componentScriptInfo(componentTypes(i))
      val domainResolvedJs = buildJs(scriptInfo)
      val domainResolvedCss = buildCss(scriptInfo)
      Ok(renderJade(
        EditorTemplateParams(
          context,
          domainResolvedJs,
          domainResolvedCss,
          jsSrc.ngModules ++ scriptInfo.ngDependencies,
          servicesJs
        ))
      )
    }

    hooks.loadItem(itemId).map { e => e.fold(onError, onItem)}
  }

}
