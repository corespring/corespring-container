package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.{ ComponentUrls, ItemTypeReader }
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.helpers.{ Helpers, LoadClientSideDependencies, XhtmlProcessor }
import org.corespring.container.client.hooks.ClientHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model.Id
import org.corespring.container.components.model.dependencies.DependencyResolver
import play.api.{Mode, Play}
import play.api.http.ContentTypes
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._
import org.corespring.container.logging.ContainerLogger

import scala.concurrent.ExecutionContext

case class ComponentScriptInfo(jsUrl: String, cssUrl: String, ngDependencies: Seq[String])

trait App[T <: ClientHooks]
  extends Controller
  with DependencyResolver
  with XhtmlProcessor
  with Helpers
  with LoadClientSideDependencies {
  self: ItemTypeReader =>

  override lazy val logger = ContainerLogger.getLogger(context)

  implicit def ec: ExecutionContext

  def context: String

  def modulePath = v2Player.Routes.prefix

  def urls: ComponentUrls

  def hooks: T

  def additionalScripts: Seq[String]

  def handleSuccess[D](fn: (D) => SimpleResult)(e: Either[StatusMessage, D]): SimpleResult = {
    e match {
      case Left((code, msg)) => Status(code)(msg)
      case Right(s) => fn(s)
    }
  }

  def load(id: String): Action[AnyContent]

  val typeRegex = "(.*?)-(.*)".r

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

  def ngModules: AngularModules = new AngularModules(s"$context.services")

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

    logger.trace(s"function=componentScriptInfo typeIds=$typeIds")
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
  lazy val loadedJsSrc = SourcePaths.fromJsonResource(modulePath, s"container-client/$context-js-report.json")

  def jsSrc: SourcePaths = {
    if(Play.current.mode == Mode.Dev) {
      SourcePaths.fromJsonResource(modulePath, s"container-client/$context-js-report.json")
    } else {
      loadedJsSrc
    }
  }

  lazy val cssSrc: SourcePaths = SourcePaths.fromJsonResource(modulePath, s"container-client/$context-css-report.json")
}
