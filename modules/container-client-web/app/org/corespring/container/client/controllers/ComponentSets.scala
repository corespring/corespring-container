package org.corespring.container.client.controllers

import org.corespring.container.client.component._
import org.corespring.container.components.model.Component
import org.corespring.container.components.services.DependencyResolver
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

  def singleResource[A >: EssentialAction](context: String, componentType: String, suffix: String): A

  protected final def generate(context: String, resolvedComponents: Seq[Component], suffix: String): (String, String) = {

    def gen(generator: SourceGenerator): String = suffix match {
      case "js" => generator.js(resolvedComponents)
      case "css" => generator.css(resolvedComponents)
      case _ => ""
    }

    val out = context match {
      case s: String if (s.contains("editor")) => gen(editorGenerator)
      case "player" => gen(playerGenerator)
      case "rig" => gen(editorGenerator)
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

  protected final def generateBodyAndContentType(context: String, directive: String, suffix: String): (String, String) = {
    val types: Seq[String] = ComponentUrlDirective(directive, allComponents)
    val usedComponents = types.map { t => allComponents.find(_.componentType == t) }.flatten
    val components = dependencyResolver.resolveComponents(usedComponents.map(_.id), Some(context))
    logger.trace(s"context: $context, comps: ${components.map(_.componentType).mkString(",")}")
    generate(context, components, suffix)
  }

  override def cssUrl(context: String, components: Seq[Component], separatePaths: Boolean): Seq[String] = url(context, components, "css", separatePaths)

  override def jsUrl(context: String, components: Seq[Component], separatePaths: Boolean): Seq[String] = url(context, components, "js", separatePaths)

  private def url(context: String, components: Seq[Component], suffix: String, separatePaths: Boolean): Seq[String] = {

    require(allComponents.length > 0, "Can't load components")

    if (separatePaths) {
      val resolvedComponents = dependencyResolver.resolveComponents(components.map(_.id), Some(context))
      resolvedComponents.map { c => routes.ComponentSets.singleResource(context, c.componentType, suffix).url }
    } else {
      components match {
        case Nil => Seq.empty
        case _ => {
          ComponentUrlDirective.unapply(components.map(_.componentType), allComponents).map { path =>
            routes.ComponentSets.resource(context, path, suffix).url
          }.toSeq
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
