package org.corespring.container.client.controllers.apps

import org.corespring.container.client.actions.{CatalogActions, EditorActions}
import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.views.txt.js.CatalogServices
import play.api.Logger
import play.api.libs.json.{ JsString, JsArray, Json, JsValue }
import play.api.mvc.AnyContent
import scala.concurrent.{ Future, ExecutionContext }

trait Catalog
  extends AllItemTypesReader
  with AppWithServices[CatalogActions[AnyContent]]
  with JsModeReading {

  val logger = Logger("catalog")

  override def context: String = "catalog"

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

    CatalogServices("catalog.services", Item.load(":id"), Item.save(":id"), JsArray(componentJson)).toString
  }

  override def additionalScripts: Seq[String] = Seq(org.corespring.container.client.controllers.apps.routes.Catalog.services().url)

  def showCatalog(itemId: String) = actions.showCatalog(itemId) {
    (code, msg) =>
      import ExecutionContext.Implicits.global
      Future(Status(code)(org.corespring.container.client.views.html.error.main(code, msg)))
  } {

    request =>
      logger.trace(s"[showCatalog]: $itemId")
      val jsMode = getJsMode(request)
      val page = s"catalog.$jsMode.html"
      controllers.Assets.at("/container-client", page)(request)
  }

}
