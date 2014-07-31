package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.{ ComponentUrls, ItemTypeReader }
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.helpers.{ Helpers, LoadClientSideDependencies, XhtmlProcessor }
import org.corespring.container.client.hooks.ClientHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model.Id
import org.corespring.container.components.model.dependencies.DependencyResolver
import org.slf4j.LoggerFactory
import play.api.http.ContentTypes
import play.api.libs.json.Json
import play.api.mvc.{ Action, Controller, SimpleResult }

import scala.concurrent.ExecutionContext

trait AppWithConfig[T <: ClientHooks]
  extends Controller
  with DependencyResolver
  with XhtmlProcessor
  with Helpers
  with LoadClientSideDependencies
  with HasLogger {
  self: ItemTypeReader =>

  def loggerName = "container.app"

  override lazy val logger = LoggerFactory.getLogger(loggerName)

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

  def config(id: String) = Action.async { implicit request =>
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
  }

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

trait AppWithServices[T <: ClientHooks] extends AppWithConfig[T] {
  self: ItemTypeReader =>

  override def ngModules: AngularModules = new AngularModules(s"$context.services")

  def services = Action {
    Ok(servicesJs.toString).as(ContentTypes.JAVASCRIPT)
  }

  def servicesJs: String
}
