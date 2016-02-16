package org.corespring.container.client.controllers.apps

import grizzled.slf4j.Logger
import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.component.{ ComponentUrls, ItemTypeReader }
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.helpers.{ Helpers, LoadClientSideDependencies }
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model._
import org.corespring.container.components.model.dependencies.DependencyResolver
import play.api.Mode.Mode
import play.api.mvc._

import scala.concurrent._

case class SingleComponentScriptBundle(component: ComponentInfo,
  js: Seq[String],
  css: Seq[String],
  ngModules: Seq[String]) {
  def componentType: String = component.componentType
}

case class ComponentScriptBundle(components: Seq[Component],
  js: Seq[String],
  css: Seq[String],
  ngModules: Seq[String]) {
  def componentTypes: Seq[String] = components.map(_.componentType)
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
  with HasContainerContext
  with ComponentScriptPrep {
  self: ItemTypeReader =>

  def mode: Mode

  private lazy val logger = Logger(classOf[App[T]])

  def showErrorInUi(implicit rh: RequestHeader): Boolean = jsMode(rh) == "dev"

  def context: String

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

}

trait ComponentScriptPrep extends DependencyResolver
  with LoadClientSideDependencies {
  def ngModules(context: String): AngularModules = new AngularModules(s"$context.services")

  private lazy val logger = Logger(classOf[ComponentScriptPrep])

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

  def pageSourceService : PageSourceService
  def jsSrc(context: String): NgSourcePaths =  pageSourceService.loadJs(context)
  def cssSrc(context: String): CssSourcePaths = pageSourceService.loadCss(context)

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

