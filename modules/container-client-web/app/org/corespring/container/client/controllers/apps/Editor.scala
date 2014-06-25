package org.corespring.container.client.controllers.apps

import org.corespring.container.client.hooks.EditorHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{ Action, AnyContent }

import scala.concurrent.Future

trait Editor
  extends AllItemTypesReader
  with AppWithServices[EditorHooks]
  with JsModeReading {

  val logger = Logger("editor")

  override def context: String = "editor"

  override def servicesJs = {
    import org.corespring.container.client.controllers.resources.routes._

    val componentJson: Seq[JsValue] = uiComponents.map {
      c =>
        val tag = tagName(c.id.org, c.id.name)
        Json.obj(
          "name" -> c.id.name,
          "title" -> JsString(c.title.getOrElse("")),
          "titleGroup" -> JsString(c.titleGroup.getOrElse("")),
          "icon" -> s"$modulePath/icon/$tag",
          "componentType" -> tag,
          "defaultData" -> c.defaultData,
          "configuration" -> (c.packageInfo \ "external-configuration").asOpt[JsObject])
    }

    EditorServices(
      "editor.services",
      Item.load(":id"),
      Item.save(":id"),
      JsArray(componentJson)).toString
  }

  override def additionalScripts: Seq[String] = Seq(org.corespring.container.client.controllers.apps.routes.Editor.services().url)

  def editItem(itemId: String, jsMode: Option[String] = None): Action[AnyContent] = Action.async { implicit request =>

    def onError(sm: StatusMessage) = {
      val (code, msg) = sm
      Future(Status(code)(org.corespring.container.client.views.html.error.main(code, msg)))
    }

    def onItem(i:JsValue) = {
      logger.trace(s"[editItem]: $itemId")
      val jsMode = getJsMode(request)
      val page = s"editor.$jsMode.html"
      controllers.Assets.at("/container-client", page)(request)
    }

    hooks.loadItem(itemId).flatMap { e => e.fold(onError, onItem) }
  }

}
