package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.controllers.helpers.JsonHelper
import org.corespring.container.client.hooks.EditorHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.views.txt.js.EditorServices
import org.corespring.container.components.model.ComponentInfo
import play.api.libs.json._
import play.api.mvc.{Action, AnyContent, SimpleResult}

trait Editor
  extends AllItemTypesReader
  with AppWithServices[EditorHooks]
  with JsModeReading
  with JsonHelper {

  def showErrorInUi: Boolean

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

  override def servicesJs = {
    import org.corespring.container.client.controllers.resources.routes._

    val componentJson: Seq[JsValue] = interactions.map(toJson)
    val widgetJson: Seq[JsValue] = widgets.map(toJson)

    EditorServices(
      "editor.services",
      Item.load(":id"),
      Item.save(":id"),
      JsArray(componentJson),
      JsArray(widgetJson)).toString
  }

  override def additionalScripts: Seq[String] = Seq(org.corespring.container.client.controllers.apps.routes.Editor.services().url)

  override def load(itemId: String): Action[AnyContent] = Action.async { implicit request =>

    def onError(sm: StatusMessage) = {
      val (code, msg) = sm
      code match {
        case SEE_OTHER => SeeOther(msg)
        case _ => Status(code)(org.corespring.container.client.views.html.error.main(code, msg, showErrorInUi))
      }
    }

    def onItem(i: JsValue): SimpleResult = {
      val scriptInfo = componentScriptInfo(i)
      val mainJs = paths(jsSrc)
      val js = mainJs ++ jsSrc.otherLibs ++ (additionalScripts :+ scriptInfo.jsUrl).distinct
      val domainResolvedJs = js.map(resolvePath)
      val css = Seq(cssSrc.dest) ++ cssSrc.otherLibs :+ scriptInfo.cssUrl
      val domainResolvedCss = css.map(resolvePath)
      logger.debug(s"domainResolvedJs: $domainResolvedJs")
      val params: Map[String, Object] = Map(
        "js" -> domainResolvedJs.toArray,
        "css" -> domainResolvedCss.toArray,
        "componentNgModules" -> s"${scriptInfo.ngDependencies.map { d => s"'$d'"}.mkString(",")}",
        "appName" -> context)
      Ok(renderJade(
        EditorTemplateParams(
          context,
          domainResolvedJs,
          domainResolvedCss,
          scriptInfo.ngDependencies))
      )
    }

    hooks.loadItem(itemId).map { e => e.fold(onError, onItem)}
  }

}
