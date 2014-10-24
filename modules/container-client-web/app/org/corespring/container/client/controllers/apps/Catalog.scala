package org.corespring.container.client.controllers.apps

import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.CatalogHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.views.txt.js.CatalogServices
import play.api.Logger
import play.api.libs.json.{ JsArray, JsString, JsValue, Json }
import play.api.mvc.{ AnyContent, SimpleResult, Action }

import scala.concurrent.{ ExecutionContext, Future }

trait Catalog
  extends AllItemTypesReader
  with App[CatalogHooks]
  with Jade {

  implicit def ec: ExecutionContext

  override def context: String = "catalog"

  def showErrorInUi: Boolean

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

  override def load(id: String): Action[AnyContent] = Action.async {
    implicit request =>
      hooks.showCatalog(id).flatMap { e =>

        def ifEmpty = {
          logger.trace(s"[showCatalog]: $id")
          val mainJs = paths(jsSrc)
          val js = mainJs ++ jsSrc.otherLibs ++ additionalScripts
          val css = cssSrc.dest +: cssSrc.otherLibs
          //CA-2186 - shouldn't have to remember to add this module...
          Ok(renderJade(CatalogTemplateParams(context, js, css, Seq("catalog.services"))))
        }

        def onError(sm: StatusMessage) = {
          val (code, msg) = sm
          Status((code))(org.corespring.container.client.views.html.error.main(code, msg, showErrorInUi))
        }
        Future(e.fold(ifEmpty)(onError))
      }
  }

}
