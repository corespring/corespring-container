package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.{ ComponentUrls, ItemTypeReader }
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.helpers.{ Helpers, LoadClientSideDependencies, XhtmlProcessor }
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.ClientHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model.Id
import org.corespring.container.components.model.dependencies.DependencyResolver
import play.api.Play
import play.api.http.ContentTypes
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._
import org.corespring.container.logging.ContainerLogger

import scala.concurrent.ExecutionContext

trait App[T <: ClientHooks]
  extends Controller
  with DependencyResolver
  with XhtmlProcessor
  with Helpers
  with LoadClientSideDependencies
  with HasLogger {
  self: ItemTypeReader =>

  def loggerName = "container.app"

  override lazy val logger = ContainerLogger.getLogger(loggerName)

  implicit def ec: ExecutionContext

  def context: String

  def modulePath = v2Player.Routes.prefix

  def urls: ComponentUrls

  def ngModules: AngularModules

  val typeRegex = "(.*?)-(.*)".r

  def hooks: T

  def additionalScripts: Seq[String]

  def handleSuccess[D](fn: (D) => SimpleResult)(e: Either[StatusMessage, D]): SimpleResult = {
    e match {
      case Left((code, msg)) => Status(code)(msg)
      case Right(s) => fn(s)
    }
  }

  protected def configToResult(xhtml: Option[String], ngDependencies: Seq[String], js: Seq[String], css: Seq[String]): SimpleResult = {
    val json = configJson(
      processXhtml(xhtml),
      ngDependencies,
      js,
      css)
    Ok(json)
  }

  def load(id: String): Action[AnyContent]

  /*def config(id: String) = Action.async { implicit request =>
    hooks.loadItem(id).map(handleSuccess { (itemJson) =>
      val typeIds = componentTypes(itemJson).map {
        t =>
          val typeRegex(org, name) = t
          new Id(org, name)
      }

      val resolvedComponents = resolveComponents(typeIds, Some(context))

      logger.trace(s"[config: $id] json: ${Json.stringify(itemJson)}")
      logger.debug(s"[config: $id] Resolved components: ${resolvedComponents.map(_.componentType).mkString(",")}")

      val jsUrl = if (resolvedComponents.length == 0) Seq.empty else Seq(urls.jsUrl(context, resolvedComponents))
      val cssUrl = if (resolvedComponents.length == 0) Seq.empty else Seq(urls.cssUrl(context, resolvedComponents))

      val clientSideDependencies = getClientSideDependencies(resolvedComponents)
      val dependencies = ngModules.createAngularModules(resolvedComponents, clientSideDependencies)
      val js = (additionalScripts ++ jsUrl).distinct

      configToResult(
        Some(processXhtml((itemJson \ "xhtml").asOpt[String])),
        dependencies,
        js,
        cssUrl)
    })
  }*/

  /**
   * Preprocess the xml so that it'll work in all browsers
   * aka: convert tagNames -> attributes for ie 8 support
   * TODO: A layout component may have multiple elements
   * So we need a way to get all potential component names from
   * each component, not just assume its the top level.
   */
  def processXhtml(maybeXhtml: Option[String]) = maybeXhtml.map {
    xhtml =>
      tagNamesToAttributes(xhtml).getOrElse {
        throw new RuntimeException(s"Error processing xhtml: $xhtml")
      }
  }.getOrElse("<div><h1>New Item</h1></div>")
}

case class ComponentScriptInfo(jsUrl: String, cssUrl: String, ngDependencies: Seq[String])

trait AppWithServices[T <: ClientHooks] extends App[T] with Jade {
  self: ItemTypeReader =>

  /**
   * A temporary means of defining paths that may be resolved
   */
  protected def resolvePath(s: String): String = {

    val needsResolution = Seq(
      "components/",
      "component-sets/",
      "editor",
      "prod-player",
      "player-services.js",
      "player.min").exists(s.contains)
    if (needsResolution) resolveDomain(s) else s
  }
  override def ngModules: AngularModules = new AngularModules(s"$context.services")

  def services = Action {
    Ok(servicesJs.toString).as(ContentTypes.JAVASCRIPT)
  }

  def servicesJs: String

  protected def jsMode(implicit r: RequestHeader): String = {
    r.getQueryString("mode").getOrElse(Play.current.mode.toString.toLowerCase)
  }

  protected def paths(d: SourcePaths)(implicit r: RequestHeader) = jsMode match {
    case "prod" => Seq(d.dest)
    case "dev" => d.src
    case _ => {
      logger.warn(s"Unknown mode $jsMode - falling back to prod")
      Seq(d.dest)
    }
  }

  protected def componentScriptInfo(itemJson: JsValue): ComponentScriptInfo = {

    val typeIds = componentTypes(itemJson).map {
      t =>
        val typeRegex(org, name) = t
        new Id(org, name)
    }

    val resolvedComponents = resolveComponents(typeIds, Some(context))
    val jsUrl = urls.jsUrl(context, resolvedComponents)
    val cssUrl = urls.cssUrl(context, resolvedComponents)
    val clientSideDependencies = getClientSideDependencies(resolvedComponents)
    val dependencies = ngModules.createAngularModules(resolvedComponents, clientSideDependencies)
    ComponentScriptInfo(jsUrl, cssUrl, dependencies)
  }

  /** Allow external domains to be configured */
  def resolveDomain(path: String): String = path

  /** Read in the src report from the client side build */
  lazy val jsSrc: SourcePaths = SourcePaths.fromJsonResource(modulePath, s"container-client/$context-js-report.json")
  lazy val cssSrc: SourcePaths = SourcePaths.fromJsonResource(modulePath, s"container-client/$context-css-report.json")
}
