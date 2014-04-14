package org.corespring.container.client.controllers.apps

import org.corespring.container.client.actions.EditorActions
import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.Logger
import play.api.libs.json.{ JsString, JsArray, Json, JsValue }
import play.api.mvc.AnyContent
import scala.concurrent.{ Future, ExecutionContext }

trait Editor extends AllItemTypesReader with AppWithServices[EditorActions[AnyContent]] {

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
          "defaultData" -> c.defaultData)
    }

    EditorServices("editor.services", Item.load(":id"), Item.save(":id"), JsArray(componentJson)).toString
  }

  override def additionalScripts: Seq[String] = Seq(org.corespring.container.client.controllers.apps.routes.Editor.services().url)

  def editItem(itemId: String) = actions.editItem(itemId) {
    (code, msg) =>
      import ExecutionContext.Implicits.global
      Future(Status(code)(org.corespring.container.client.views.html.error.main(code, msg)))
  } {
    request =>
      logger.trace(s"[editItem]: $itemId")
      controllers.Assets.at("/container-client", "editor.html")(request)
  }
}
