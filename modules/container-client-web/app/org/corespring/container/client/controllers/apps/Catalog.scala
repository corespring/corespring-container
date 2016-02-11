package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.controllers.GetAsset
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.{ LoadHook, CatalogHooks }
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.views.models.SupportingMaterialsEndpoints
import org.corespring.container.client.views.txt.js.CatalogServices
import play.api.libs.json.{ JsArray, JsString, JsValue, Json }
import play.api.mvc.{ Action, AnyContent }

import scala.concurrent.{ Future }

trait Catalog
  extends AllItemTypesReader
  with App[CatalogHooks]
  with Jade
  with GetAsset[CatalogHooks] {

  override def context: String = "catalog"

  def servicesJs(itemId: String) = {
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

    import org.corespring.container.client.controllers.resources.routes

    val smEndpoints = SupportingMaterialsEndpoints(
      create = routes.Item.createSupportingMaterial(itemId),
      createFromFile = routes.Item.createSupportingMaterialFromFile(itemId),
      delete = routes.Item.deleteSupportingMaterial(itemId, ":name"),
      addAsset = routes.Item.addAssetToSupportingMaterial(itemId, ":name"),
      deleteAsset = routes.Item.deleteAssetFromSupportingMaterial(itemId, ":name", ":filename"),
      getAsset = routes.Item.getAssetFromSupportingMaterial(itemId, ":name", ":filename"),
      updateContent = routes.Item.updateSupportingMaterialContent(itemId, ":name", ":filename"))

    CatalogServices("catalog.services", Item.load(itemId), JsArray(componentJson), smEndpoints).toString
  }

  def load(id: String): Action[AnyContent] = Action.async {
    implicit request =>
      hooks.showCatalog(id).flatMap { e =>

        def ifEmpty = {
          logger.trace(s"[showCatalog]: $id")

          val scriptInfo = componentScriptInfo(context, componentTypes(Json.obj()), jsMode == "dev")
          val domainResolvedJs = buildJs(scriptInfo)
          val domainResolvedCss = buildCss(scriptInfo)
          Ok(
            renderJade(
              CatalogTemplateParams(
                context,
                domainResolvedJs,
                domainResolvedCss,
                jsSrc(context).ngModules ++ scriptInfo.ngDependencies,
                servicesJs(id),
                StaticPaths.staticPaths)))
        }

        def onError(sm: StatusMessage) = {
          val (code, msg) = sm
          Status((code))(org.corespring.container.client.views.html.error.main(code, msg, showErrorInUi))
        }
        Future(e.fold(ifEmpty)(onError))
      }
  }

}
