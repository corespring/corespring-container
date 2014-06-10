package org.corespring.container.client.controllers.apps

import org.corespring.container.client.actions.EditorActions
import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.{ Play, Mode, Logger }
import play.api.libs.json._
import play.api.mvc.AnyContent
import scala.concurrent.{ Future, ExecutionContext }
import play.api.libs.json.JsArray
import play.api.libs.json.JsString

trait Editor
  extends AllItemTypesReader
  with AppWithServices[EditorActions[AnyContent]]
  with JsModeReading {

  val logger = Logger("editor")

  override def context: String = "editor"

  def callCreator: CallCreator

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
      callCreator.wrap(Item.load(":id")),
      callCreator.wrap(Item.save(":id")),
      JsArray(componentJson)).toString
  }

  override def additionalScripts: Seq[String] = Seq(org.corespring.container.client.controllers.apps.routes.Editor.services().url)

  def editItem(itemId: String, jsMode: Option[String] = None) = actions.editItem(itemId) {
    (code, msg) =>
      import ExecutionContext.Implicits.global
      Future(Status(code)(org.corespring.container.client.views.html.error.main(code, msg)))
  } {
    request =>
      logger.trace(s"[editItem]: $itemId")
      val jsMode = getJsMode(request)
      val page = s"editor.$jsMode.html"
      controllers.Assets.at("/container-client", page)(request)
  }

}
