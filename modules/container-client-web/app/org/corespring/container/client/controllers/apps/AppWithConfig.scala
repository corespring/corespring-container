package org.corespring.container.client.controllers.apps

import org.corespring.container.client.hooks.ClientHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.component.{ ComponentUrls, ItemTypeReader }
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.helpers.{LoadClientSideDependencies, Helpers, XhtmlProcessor}
import org.corespring.container.components.model.dependencies.DependencyResolver
import org.corespring.container.components.model.packaging.{ ClientDependencies, ClientSideDependency }
import org.corespring.container.components.model.{ Component, Id }
import play.api.http.ContentTypes
import play.api.libs.json.JsObject
import play.api.mvc.{ Action, Controller, SimpleResult }

import scala.concurrent.ExecutionContext

trait AppWithConfig[T <: ClientHooks]
  extends Controller
  with DependencyResolver
  with XhtmlProcessor
  with Helpers
  with LoadClientSideDependencies{
  self: ItemTypeReader =>

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
      val jsUrl = urls.jsUrl(context, resolvedComponents)
      val cssUrl = urls.cssUrl(context, resolvedComponents)

      val clientSideDependencies = getClientSideDependencies(resolvedComponents)
      val dependencies = ngModules.createAngularModules(resolvedComponents, clientSideDependencies)
      val localScripts = getLocalScripts(resolvedComponents)
      val js = (localScripts ++ additionalScripts :+ jsUrl).distinct
      val css = Seq(cssUrl)

      configToResult(
        Some(processXhtml((itemJson \ "xhtml").asOpt[String])),
        dependencies,
        js,
        css)
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


  /*
  protected def get3rdPartyScripts(deps: Seq[ClientSideDependency]): Seq[String] = {
    val scripts = deps.map {
      d =>
        d.files match {
          case Seq(p) => Some(s"$modulePath/components/${d.name}/${d.files(0)}")
          case _ => None
        }
    }.flatten
    scripts
  }*/

  protected def getLocalScripts(comps: Seq[Component]): Seq[String] = {

    def assetPath(compAndPath: (Component, Seq[String]), acc: Seq[String]) = {
      val (c, filenames) = compAndPath
      acc ++ filenames.map(f => s"$modulePath/libs/${c.id.org}/${c.id.name}/$f")
    }

    val out = for {
      comp <- comps
      lib <- (comp.packageInfo \ "libs").asOpt[JsObject]
      client <- (lib \ "client").asOpt[JsObject]
    } yield (comp, client.fields.map(_._2.as[Seq[String]]).flatten)

    val assetPaths = out.foldRight[Seq[String]](Seq.empty)(assetPath)
    assetPaths
  }
}

trait AppWithServices[T <: ClientHooks] extends AppWithConfig[T] {
  self: ItemTypeReader =>

  override def ngModules: AngularModules = new AngularModules(s"$context.services")

  def services = Action {
    Ok(servicesJs.toString).as(ContentTypes.JAVASCRIPT)
  }

  def servicesJs: String
}
