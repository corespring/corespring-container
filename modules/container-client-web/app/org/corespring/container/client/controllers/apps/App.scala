package org.corespring.container.client.controllers.apps

import grizzled.slf4j.Logger
import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.component.{ ComponentUrls, ItemTypeReader }
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.helpers.{ JsonHelper, NameHelper, Helpers, LoadClientSideDependencies }
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model._
import org.corespring.container.components.model.dependencies.DependencyResolver
import play.api.Mode.Mode
import play.api.libs.json.{ JsObject, JsBoolean, JsString, JsValue }
import play.api.mvc._

import scala.concurrent._

case class ComponentScriptBundle(component: Component,
  js: Seq[String],
  css: Seq[String],
  ngModules: Seq[String]) {
  def componentType: String = component.componentType
}

case class ComponentScriptInfo(context: String, jsUrl: Seq[String],
  cssUrl: Seq[String],
  ngDependencies: Seq[String])

trait HasLogger {
  def logger: Logger
}

trait App[T]
  extends Controller
  with DependencyResolver
  with Helpers
  with LoadClientSideDependencies
  with HasLogger
  with HasContainerContext
  with ComponentScriptPrep {
  self: ItemTypeReader =>

  def mode: Mode

  override lazy val logger = Logger(classOf[App[T]])

  def showErrorInUi(implicit rh: RequestHeader): Boolean = jsMode(rh) == "dev"

  def context: String

  def urls: ComponentUrls

  def hooks: T

  def sourcePaths: SourcePathsService

  object handleSuccess {

    def apply[D](fn: (D) => SimpleResult)(e: Either[StatusMessage, D]): SimpleResult = e match {
      case Left((code, msg)) => Status(code)(msg)
      case Right(s) => fn(s)
    }

    def async[D](fn: (D) => Future[SimpleResult])(e: Either[StatusMessage, D]): Future[SimpleResult] = e match {
      case Left((code, msg)) => Future { Status(code)(msg) }
      case Right(s) => fn(s)
    }

  }

}

trait ComponentInfoJson extends NameHelper with JsonHelper {

  protected def toJson(iconPath: String => String)(ci: ComponentInfo) = {

    val tag = tagName(ci.id.org, ci.id.name)

    val icon = ci match {
      case i: Interaction if i.icon.isDefined => Some(JsString(iconPath(tag)))
      case w: Widget if w.icon.isDefined => Some(JsString(iconPath(tag)))
      case _ => None
    }

    partialObj(
      "name" -> Some(JsString(ci.id.name)),
      "title" -> Some(JsString(ci.title.getOrElse(""))),
      "titleGroup" -> Some(JsString(ci.titleGroup.getOrElse(""))),
      "icon" -> icon,
      "released" -> Some(JsBoolean(ci.released)),
      "insertInline" -> Some(JsBoolean(ci.insertInline)),
      "componentType" -> Some(JsString(tag)),
      "defaultData" -> Some(ci.defaultData),
      "configuration" -> (ci.packageInfo \ "external-configuration").asOpt[JsObject])
  }

  protected def componentInfoToJson(modulePath: String)(ci: ComponentInfo): JsValue = {
    toJson((tag) => s"$modulePath/icon/$tag")(ci)
  }
}

trait ComponentScriptPrep extends DependencyResolver
  with LoadClientSideDependencies {
  def ngModules(context: String): AngularModules = new AngularModules(s"$context.services")

  private val typeRegex = "(.*?)-(.*)".r
  def urls: ComponentUrls

  def mode: Mode

  protected def jsMode(implicit r: RequestHeader): String = {
    r.getQueryString("mode").getOrElse(mode.toString.toLowerCase)
  }

  protected def paths(d: SourcePaths)(implicit r: RequestHeader) = jsMode match {
    case "prod" => Seq(d.dest)
    case "dev" => d.src
    case _ => {
      logger.warn(s"Unknown mode $jsMode - falling back to prod")
      Seq(d.dest)
    }
  }

  def modulePath = v2Player.Routes.prefix

  def sourcePaths: SourcePathsService

  /** Allow external domains to be configured */
  def resolveDomain(path: String): String = path

  /**
   * A temporary means of defining paths that may be resolved
   */
  protected def resolvePath(s: String): String = {

    val needsResolution = Seq(
      "components/",
      "component-sets/",
      "editor",
      "-prod",
      "player.min").exists(s.contains)
    if (needsResolution) resolveDomain(s) else s
  }

  def jsSrc(context: String): NgSourcePaths = ???
  //  {
  //    sourcePaths.load[NgSourcePaths](ContextAndSuffix(context, "js"), NgSourcePaths.fromJsonResource(modulePath, _))
  //  }

  def cssSrc(context: String): CssSourcePaths = ???
  //  {
  //    sourcePaths.load[CssSourcePaths](ContextAndSuffix(context, "css"), CssSourcePaths.fromJsonResource(modulePath, _))
  //  }

  protected def buildJs(scriptInfo: ComponentScriptInfo,
    extras: Seq[String] = Seq.empty)(implicit rh: RequestHeader) = {
    val jsSourcePaths = jsSrc(scriptInfo.context)
    val mainJs = paths(jsSourcePaths)
    val js = jsSourcePaths.otherLibs ++ mainJs ++ scriptInfo.jsUrl ++ extras
    js.distinct.map(resolvePath)
  }

  protected def buildCss(scriptInfo: ComponentScriptInfo)(implicit rh: RequestHeader) = {
    val cssSourcePaths = cssSrc(scriptInfo.context)
    val out = paths(cssSourcePaths) ++ cssSourcePaths.otherLibs ++ scriptInfo.cssUrl
    out.map(resolvePath)
  }

  protected def componentScriptInfo(context: String, components: Seq[String], separatePaths: Boolean, reportName: Option[String] = None): ComponentScriptInfo = {

    val typeIds = components.map {
      t =>
        val typeRegex(org, name) = t
        new Id(org, name)
    }

    logger.trace(s"function=componentScriptInfo typeIds=$typeIds")
    val resolvedComponents = resolveComponents(typeIds, Some(context))
    val jsUrl = urls.jsUrl(context, resolvedComponents, separatePaths)
    val cssUrl = urls.cssUrl(context, resolvedComponents, separatePaths)
    val clientSideDependencies = getClientSideDependencies(resolvedComponents)
    val dependencies = ngModules(context).createAngularModules(resolvedComponents, clientSideDependencies)
    ComponentScriptInfo(context, jsUrl, cssUrl, dependencies)
  }
}

