package org.corespring.container.client.controllers.apps

import java.net.URLEncoder

import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.controllers.AssetsController
import org.corespring.container.client.controllers.helpers.{ QueryHelper, JsonHelper }
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.{ EditorHooks }
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model.ComponentInfo
import play.api.libs.json._
import play.api.mvc._
import v2Player.Routes

object StaticPaths {
  val assetUrl = Routes.prefix + "/images"

  val staticPaths = Json.obj(
    "assets" -> assetUrl,
    "dataQuery" -> org.corespring.container.client.controllers.routes.DataQuery.list(":topic").url.replace("/:topic", ""),
    "collection" -> org.corespring.container.client.controllers.resources.routes.Collection.list().url)
}

trait CoreEditor
  extends AllItemTypesReader
  with App[EditorHooks]
  with JsonHelper
  with Jade
  with AssetsController[EditorHooks]
  with QueryHelper {

  override def context: String = "editor"

  def versionInfo: JsObject

  def debounceInMillis: Long = 5000

  protected def toJson(ci: ComponentInfo): JsValue = {
    val tag = tagName(ci.id.org, ci.id.name)
    partialObj(
      "name" -> Some(JsString(ci.id.name)),
      "title" -> Some(JsString(ci.title.getOrElse(""))),
      "titleGroup" -> Some(JsString(ci.titleGroup.getOrElse(""))),
      "icon" -> ((interactions ++ widgets).find(_.componentType == tag).map(_.icon) match {
        case Some(iconBytes) => iconBytes match {
          case Some(thing) => Some(JsString(s"$modulePath/icon/$tag"))
          case _ => None
        }
        case _ => None
      }),
      "released" -> Some(JsBoolean(ci.released)),
      "componentType" -> Some(JsString(tag)),
      "defaultData" -> Some(ci.defaultData),
      "configuration" -> (ci.packageInfo \ "external-configuration").asOpt[JsObject])
  }

  def servicesJs(id: String, components: JsArray, widgets: JsArray): String

  def removableQueryStringParams = Seq[String]()

  def load(id: String): Action[AnyContent] = Action.async { implicit request =>

    import org.corespring.container.client.views.html.error

    def onError(sm: StatusMessage) = {
      val (code, msg) = sm
      code match {
        case SEE_OTHER => SeeOther(msg)
        case _ => Status(code)(error.main(code, msg, showErrorInUi))
      }
    }

    def onItem(i: JsValue): SimpleResult = {
      val serviceParams = queryParams(mapToJson)
      val colors = (serviceParams \ "colors").asOpt[String].getOrElse("default")
      println("COL:" + colors)

      val scriptInfo = componentScriptInfo(componentTypes(i), jsMode == "dev", colors)
      val domainResolvedJs = buildJs(scriptInfo)
      val domainResolvedCss = buildCss(scriptInfo)
      val domainResolvedLess = buildLess(scriptInfo)
      val componentsArray: JsArray = JsArray(interactions.map(toJson))
      val widgetsArray: JsArray = JsArray(widgets.map(toJson))

      val options = EditorClientOptions(
        debounceInMillis,
        StaticPaths.staticPaths)

      Ok(renderJade(
        EditorTemplateParams(
          context,
          domainResolvedJs,
          domainResolvedCss,
          domainResolvedLess,
          jsSrc.ngModules ++ scriptInfo.ngDependencies,
          servicesJs(id, componentsArray, widgetsArray),
          versionInfo,
          options)))
    }

    hooks.load(id).map { e => e.fold(onError, onItem) }
  }
}

