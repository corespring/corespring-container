package org.corespring.container.client.controllers

import java.net.URL

import org.corespring.container.client.component._
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.DependencyResolver
import org.corespring.container.logging.ContainerLogger
import play.api.http.ContentTypes
import play.api.mvc._

trait ComponentSets extends Controller with ComponentUrls {

  private lazy val logger = ContainerLogger.getLogger("ComponentSets")

  def allComponents: Seq[Component]

  def playerGenerator: SourceGenerator

  def editorGenerator: SourceGenerator

  def catalogGenerator: SourceGenerator

  def dependencyResolver: DependencyResolver

  def resource[A >: EssentialAction](context: String, directive: String, suffix: String): A

  protected final def generateBodyAndContentType(context: String, directive: String, suffix: String): (String, String) = {

    val types: Seq[String] = ComponentUrlDirective(directive, allComponents)

    val usedComponents = types.map { t => allComponents.find(_.componentType == t) }.flatten
    val components = dependencyResolver.resolveComponents(usedComponents.map(_.id), Some(context))

    logger.trace(s"context: $context, comps: ${components.map(_.componentType).mkString(",")}")

    def gen(generator: SourceGenerator): String = suffix match {
      case "js" => generator.js(components.toSeq)
      case "css" => generator.css(components.toSeq)
      case _ => ""
    }

    val out = context match {
      case "editor" => gen(editorGenerator)
      case "player" => gen(playerGenerator)
      case "rig" => gen(editorGenerator)
      case "dev-editor" => gen(editorGenerator)
      case "catalog" => gen(catalogGenerator)
      case _ => throw new RuntimeException(s"Error: unknown context: $context")
    }

    val contentType = suffix match {
      case "js" => ContentTypes.JAVASCRIPT
      case "css" => ContentTypes.CSS
      case _ => throw new RuntimeException(s"Unknown suffix: $suffix")
    }

    (out, contentType)

  }

  override def cssUrl(context: String, components: Seq[Component]): Option[String] = url(context, components, "css")

  override def jsUrl(context: String, components: Seq[Component]): Option[String] = url(context, components, "js")

  private def url(context: String, components: Seq[Component], suffix: String): Option[String] = {

    require(allComponents.length > 0, "Can't load components")

    components match {
      case Nil => None
      case _ => {
        ComponentUrlDirective.unapply(components.map(_.componentType), allComponents).map { path =>
          routes.ComponentSets.resource(context, path, suffix).url
        }
      }
    }
  }
}

trait DefaultComponentSets extends ComponentSets
  with ResourceLoading
  with LibrarySourceLoading {

  val editorGenerator: SourceGenerator = new EditorGenerator() {
    override def resource(p: String) = DefaultComponentSets.this.resource(p)

    override def loadLibrarySource(path: String): Option[String] = DefaultComponentSets.this.loadLibrarySource(path)
  }

  val playerGenerator: SourceGenerator = new PlayerGenerator() {
    override def resource(p: String) = DefaultComponentSets.this.resource(p)
    override def loadLibrarySource(path: String): Option[String] = DefaultComponentSets.this.loadLibrarySource(path)
  }

  val catalogGenerator: SourceGenerator = new CatalogGenerator() {
    override def resource(p: String) = DefaultComponentSets.this.resource(p)
    override def loadLibrarySource(path: String): Option[String] = DefaultComponentSets.this.loadLibrarySource(path)
  }
}
