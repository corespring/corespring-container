package org.corespring.container.client.controllers.apps

import grizzled.slf4j.Logger
import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.controllers.AssetsController
import org.corespring.container.client.controllers.helpers.JsonHelper
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.EditorHooks
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
    "collection" -> org.corespring.container.client.controllers.resources.routes.Collection.list().url,
    "metadata" -> org.corespring.container.client.controllers.resources.routes.ItemMetadata.get(":id").url)
}

trait CoreEditor
  extends AllItemTypesReader
  with App[EditorHooks]
  with JsonHelper
  with Jade
  with AssetsController[EditorHooks] {

  override lazy val logger = Logger(classOf[CoreEditor])

  override def context: String = "editor"

  def versionInfo: JsObject

  def debounceInMillis: Long = 5000

  lazy val componentsArray: JsArray = JsArray(interactions.map(toJson))
  lazy val widgetsArray: JsArray = JsArray(widgets.map(toJson))

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
      "insertInline" -> Some(JsBoolean(ci.insertInline)),
      "componentType" -> Some(JsString(tag)),
      "defaultData" -> Some(ci.defaultData),
      "configuration" -> (ci.packageInfo \ "external-configuration").asOpt[JsObject])
  }

  def componentEditorServices(id:String, components: JsArray) : String

  def servicesJs(id: String, components: JsArray, widgets: JsArray): String

  private def loadItem(appContext: AppContext,
                       componentsJson: JsArray,
                       widgetsJson: JsArray,
                       loadComponentTypes: JsValue => Seq[String],
                       servicesJsSrc:String)(id: String): Action[AnyContent] = Action.async { implicit request =>

    import org.corespring.container.client.views.html.error

    def onError(sm: StatusMessage) = {
      val (code, msg) = sm
      code match {
        case SEE_OTHER => SeeOther(msg)
        case _ => Status(code)(error.main(code, msg, showErrorInUi))
      }
    }

    def onItem(i: JsValue): SimpleResult = {
      val scriptInfo = componentScriptInfo(appContext, loadComponentTypes(i), jsMode == "dev")
      val domainResolvedJs = buildJs(scriptInfo)
      val domainResolvedCss = buildCss(scriptInfo)

      val options = EditorClientOptions(
        debounceInMillis,
        StaticPaths.staticPaths)


      val jsSrcPaths = jsSrc(appContext)

      Ok(renderJade(
        EditorTemplateParams(
          appContext.sub.getOrElse(appContext.main),
          domainResolvedJs,
          domainResolvedCss,
          jsSrcPaths.ngModules ++ scriptInfo.ngDependencies,
          servicesJsSrc,
          versionInfo,
          options)))
    }

    hooks.load(id).map { e => e.fold(onError, onItem) }
  }

  def load(id: String): Action[AnyContent] = {
    loadItem(
      AppContext(context, None),
      componentsArray,
      widgetsArray,
      componentTypes _,
      servicesJs(id, componentsArray, widgetsArray)
    )(id)
  }
  def loadSingleComponent(id: String): Action[AnyContent] = {
    loadItem(
      AppContext(context, Some("singleComponentEditor")),
      JsArray(),
      JsArray(),
      (i) => (i \ "components" \\ "componentType").map(_.as[String]).take(1),
      componentEditorServices(id, componentsArray)
    )(id)
  }
}

