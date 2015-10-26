package org.corespring.container.client.controllers.apps

import grizzled.slf4j.Logger
import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.component.{ ComponentUrls, ItemTypeReader }
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.helpers.{ Helpers, LoadClientSideDependencies }
import org.corespring.container.client.hooks.LoadHook
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model.Id
import org.corespring.container.components.model.dependencies.DependencyResolver
import play.api.Mode.Mode
import play.api.{ Mode }
import play.api.http.ContentTypes
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._
import org.corespring.container.logging.ContainerLogger

import scala.concurrent._

case class ComponentScriptInfo(jsUrl: Seq[String], cssUrl: Seq[String], ngDependencies: Seq[String])

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

  override lazy val logger = ContainerLogger.getLogger(context)

  def showErrorInUi(implicit rh: RequestHeader): Boolean = jsMode(rh) == "dev"

  def context: String

  def modulePath = v2Player.Routes.prefix

  def urls: ComponentUrls

  def hooks: T

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

  def ngModules: AngularModules = new AngularModules(s"$context.services")

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
    val mainJs = paths(jsSrc)
    val js = mainJs ++ jsSrc.otherLibs ++ scriptInfo.jsUrl ++ extras
    js.distinct.map(resolvePath)
  }

  protected def buildCss(scriptInfo: ComponentScriptInfo)(implicit rh: RequestHeader) = {
    val css = paths(cssSrc) ++ cssSrc.otherLibs ++ scriptInfo.cssUrl.toSeq
    css.map(resolvePath)
  }

  protected def componentScriptInfo(components: Seq[String], separatePaths: Boolean): ComponentScriptInfo = {

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
    val dependencies = ngModules.createAngularModules(resolvedComponents, clientSideDependencies)
    ComponentScriptInfo(jsUrl, cssUrl, dependencies)
  }

  /** Allow external domains to be configured */
  def resolveDomain(path: String): String = path

  /** Read in the src report from the client side build */
  lazy val loadedJsSrc: NgSourcePaths = NgSourcePaths.fromJsonResource(modulePath, s"container-client/$context-js-report.json")

  lazy val jsPathHolder = new PathHolder[NgSourcePaths](modulePath, context, "js", NgSourcePaths.fromJsonResource _)
  lazy val cssPathHolder = new PathHolder[CssSourcePaths](modulePath, context, "css", CssSourcePaths.fromJsonResource _)
  def jsSrc: NgSourcePaths = jsPathHolder.src(mode)
  def cssSrc: CssSourcePaths = cssPathHolder.src(mode)
}

/**
 * Loads in a source path, if Play.current.mode == Dev it reloads it each time
 */
private[apps] class PathHolder[A <: SourcePaths](path: String, context: String, suffix: String, loadFn: (String, String) => A) {

  private val reportName = s"container-client/$context-$suffix-report.json"

  /** Read in the src report from the client side build */
  private lazy val loaded: A = loadFn(path, reportName)

  private def load = loadFn(path, reportName)

  def src(mode: Mode): A = {
    if (mode == Mode.Dev) {
      load
    } else {
      loaded
    }
  }

}
