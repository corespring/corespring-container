package org.corespring.container.client.controllers.apps

import org.corespring.container.client.hooks.EditorHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.views.txt.js.EditorServices
import org.corespring.container.components.model.ComponentInfo
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{ SimpleResult, Action, AnyContent }

import scala.concurrent.Future

trait Editor
  extends AllItemTypesReader
  with AppWithServices[EditorHooks]
  with JsModeReading {

  override lazy val logger = Logger("container.editor")

  override def context: String = "editor"

  private def toJson(ci: ComponentInfo): JsValue = {
    val tag = tagName(ci.id.org, ci.id.name)
    Json.obj(
      "name" -> ci.id.name,
      "title" -> JsString(ci.title.getOrElse("")),
      "titleGroup" -> JsString(ci.titleGroup.getOrElse("")),
      "icon" -> s"$modulePath/icon/$tag",
      "componentType" -> tag,
      "defaultData" -> ci.defaultData,
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

  def editItem(itemId: String, jsMode: Option[String] = None): Action[AnyContent] = Action.async { implicit request =>

    def onError(sm: StatusMessage) = {
      val (code, msg) = sm
      Future {
        code match {
          case SEE_OTHER => SeeOther(msg)
          case _ => Status(code)(org.corespring.container.client.views.html.error.main(code, msg))
        }
      }
    }

    def onItem(i: JsValue) = {
      val jsMode = getJsMode(request)
      val page = s"editor.$jsMode.html"
      logger.trace(s"[editItem] $itemId; page $page")
      controllers.Assets.at("/container-client", page)(request)
    }

    hooks.loadItem(itemId).flatMap { e => e.fold(onError, onItem) }
  }

}
