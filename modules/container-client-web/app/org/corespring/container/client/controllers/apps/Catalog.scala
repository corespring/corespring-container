package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.CatalogHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.views.txt.js.CatalogServices
import play.api.libs.json.{ JsArray, JsString, JsValue, Json }
import play.api.mvc.{ Action, AnyContent }

import scala.concurrent.{ Future }

trait Catalog
  extends AllItemTypesReader
  with App[CatalogHooks]
  with Jade {

  override def context: String = "catalog"

  val servicesJs = {
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

  override def load(id: String): Action[AnyContent] = Action.async {
    implicit request =>
      hooks.showCatalog(id).flatMap { e =>

        def ifEmpty = {
          logger.trace(s"[showCatalog]: $id")

          val scriptInfo = componentScriptInfo(componentTypes(Json.obj()), false)
          val domainResolvedJs = buildJs(scriptInfo)
          val domainResolvedCss = buildCss(scriptInfo)
          Ok(
            renderJade(
              CatalogTemplateParams(
                context,
                domainResolvedJs,
                domainResolvedCss,
                jsSrc.ngModules ++ scriptInfo.ngDependencies,
                servicesJs)))
        }

        def onError(sm: StatusMessage) = {
          val (code, msg) = sm
          Status((code))(org.corespring.container.client.views.html.error.main(code, msg, showErrorInUi))
        }
        Future(e.fold(ifEmpty)(onError))
      }
  }

}
