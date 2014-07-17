package org.corespring.container.client.controllers.apps

import org.corespring.container.client.hooks.CatalogHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.views.txt.js.CatalogServices
import play.api.Logger
import play.api.libs.json.{ JsArray, JsString, JsValue, Json }
import play.api.mvc.{ SimpleResult, Action }

import scala.concurrent.{ ExecutionContext, Future }

trait Catalog
  extends AllItemTypesReader
  with AppWithServices[CatalogHooks]
  with JsModeReading {

  implicit def ec: ExecutionContext

  override lazy val logger = Logger("container.catalog")

  override def context: String = "catalog"

  override def servicesJs = {
    import org.corespring.container.client.controllers.resources.routes._

    val componentJson: Seq[JsValue] = interactions.map {
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

  def showCatalog(itemId: String) = Action.async {
    implicit request =>
      hooks.showCatalog(itemId).flatMap { e =>

        def ifEmpty = {
          logger.trace(s"[showCatalog]: $itemId")
          val jsMode = getJsMode(request)
          val page = s"catalog.$jsMode.html"
          controllers.Assets.at("/container-client", page)(request)
        }

        def onError(sm: StatusMessage) = {
          val (code, msg) = sm
          Future(Status((code))(org.corespring.container.client.views.html.error.main(code, msg)))
        }
        e.fold(ifEmpty)(onError)
      }
  }

}
