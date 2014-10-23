package org.corespring.container.client.controllers.apps

import org.corespring.container.client.hooks.CatalogHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.views.txt.js.CatalogServices
import play.api.Logger
import play.api.libs.json.{ JsArray, JsString, JsValue, Json }
import play.api.mvc.{AnyContent, SimpleResult, Action}

import scala.concurrent.{ ExecutionContext, Future }

trait Catalog
  extends AllItemTypesReader
  with AppWithServices[CatalogHooks]
  with JsModeReading {

  implicit def ec: ExecutionContext

  override def context: String = "catalog"

  def showErrorInUi:Boolean

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

  override def load(id: String): Action[AnyContent] = Action(BadRequest("TODO"))

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
          Future(Status((code))(org.corespring.container.client.views.html.error.main(code, msg, showErrorInUi)))
        }
        e.fold(ifEmpty)(onError)
      }
  }

}
