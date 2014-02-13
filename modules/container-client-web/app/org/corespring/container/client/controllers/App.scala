package org.corespring.container.client.controllers

import org.corespring.container.client.actions.ClientActions
import org.corespring.container.client.component.{ComponentUrls, ItemTypeReader, DependencyResolver, SourceGenerator}
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.helpers.{Helpers, XhtmlProcessor}
import org.corespring.container.components.model.packaging.{ClientSideDependency, ClientDependencies}
import org.corespring.container.components.model.{Component, Id}
import play.api.libs.json.JsObject
import play.api.mvc.{Action, AnyContent, Controller}
import org.corespring.container.client.cache.ContainerCache

trait App
  extends Controller
  with DependencyResolver
  with XhtmlProcessor
  with Helpers { self : ItemTypeReader =>

  def context : String

  def modulePath = v2Player.Routes.prefix

  def urls: ComponentUrls

  def ngModules: AngularModules

  def generator: SourceGenerator

  val typeRegex = "(.*?)-(.*)".r

  def actions: ClientActions[AnyContent]

  def additionalScripts : Seq[String]

  def config(id: String) = actions.loadConfig(id) {
    request =>

      val typeIds = componentTypes(request.item).map {
        t =>
          val typeRegex(org, name) = t
          new Id(org, name)
      }

      val components = resolveComponents(typeIds, context)
      val names = components.map(_.componentType)
      val jsUrl = urls.jsUrl(context, names, generator.js(components))
      val cssUrl = urls.cssUrl(context, names, generator.css(components))

      val clientSideDependencies = getClientSideDependencies(components)
      val dependencies = ngModules.createAngularModules(components, clientSideDependencies)
      val clientSideScripts = get3rdPartyScripts(clientSideDependencies)
      val localScripts = getLocalScripts(components)
      val js = (clientSideScripts ++ localScripts ++ additionalScripts :+ jsUrl).distinct.sorted
      val css = Seq(cssUrl)

      val json = configJson(
        processXhtml((request.item \ "xhtml").asOpt[String]),
        dependencies,
        js,
        css
      )
      Ok(json)
  }

  /** Preprocess the xml so that it'll work in all browsers
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

  private def getClientSideDependencies(comps: Seq[Component]): Seq[ClientSideDependency] = {
    val packages = comps.map(_.packageInfo)
    val deps = packages.flatMap(p => (p \ "dependencies").asOpt[JsObject])
    deps.map(ClientDependencies(_)).flatten
  }

  private def get3rdPartyScripts(deps: Seq[ClientSideDependency]): Seq[String] = {
    val scripts = deps.map {
      d =>
        d.files match {
          case Seq(p) => Some(s"$modulePath/components/${d.name}/${d.files(0)}")
          case _ => None
        }
    }.flatten
    scripts
  }

  private def getLocalScripts(comps: Seq[Component]): Seq[String] = {

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

trait AppWithServices extends App { self : ItemTypeReader =>

  def cache : ContainerCache

  def services = {
    val key = s"$context.services"
    Action{
      if(!cache.has(key)){
        cache.set(key, servicesJs.toString )
      }

      cache.get(key).map(Ok(_)).getOrElse(NotFound(""))
    }
  }

  def servicesJs : String
}
