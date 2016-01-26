package org.corespring.container.client.controllers.apps

import grizzled.slf4j.Logger
import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.component.{ ComponentUrls, ItemTypeReader }
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.helpers.{ Helpers, LoadClientSideDependencies }
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model.Id
import org.corespring.container.components.model.dependencies.DependencyResolver
import play.api.Mode.Mode
import play.api.mvc._

import scala.concurrent._

case class AppContext(main: String, sub: Option[String] = None)
case class ComponentScriptInfo(context: AppContext,
  jsUrl: Seq[String],
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
  with HasContainerContext {
  self: ItemTypeReader =>

  def mode: Mode

  override lazy val logger = Logger(classOf[App[T]])

  def showErrorInUi(implicit rh: RequestHeader): Boolean = jsMode(rh) == "dev"

  def context: String

  def modulePath = v2Player.Routes.prefix

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

  val typeRegex = "(.*?)-(.*)".r

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

  def ngModules(appContext:AppContext): AngularModules = new AngularModules(s"${appContext.sub.getOrElse(appContext.main)}.services")

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

  protected def componentScriptInfo(appContext: AppContext, components: Seq[String], separatePaths: Boolean, reportName: Option[String] = None): ComponentScriptInfo = {

    val typeIds = components.map {
      t =>
        val typeRegex(org, name) = t
        new Id(org, name)
    }

    logger.trace(s"function=componentScriptInfo typeIds=$typeIds")
    val resolvedComponents = resolveComponents(typeIds, Some(appContext.main))
    val jsUrl = urls.jsUrl(appContext.main, resolvedComponents, separatePaths)
    val cssUrl = urls.cssUrl(appContext.main, resolvedComponents, separatePaths)
    val clientSideDependencies = getClientSideDependencies(resolvedComponents)
    val dependencies = ngModules(appContext).createAngularModules(resolvedComponents, clientSideDependencies)
    ComponentScriptInfo(appContext, jsUrl, cssUrl, dependencies)
  }

  /** Allow external domains to be configured */
  def resolveDomain(path: String): String = path

  def jsSrc(appContext: AppContext): NgSourcePaths = {
    sourcePaths.load[NgSourcePaths](ContextAndSuffix(appContext, "js"), NgSourcePaths.fromJsonResource(modulePath, _))
  }

  def cssSrc(appContext: AppContext): CssSourcePaths = {
    sourcePaths.load[CssSourcePaths](ContextAndSuffix(appContext, "css"), CssSourcePaths.fromJsonResource(modulePath, _))
  }
}

