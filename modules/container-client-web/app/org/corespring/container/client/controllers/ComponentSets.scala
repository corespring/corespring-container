package org.corespring.container.client.controllers

import org.corespring.container.client.component._
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.DependencyResolver
import play.api.Logger
import play.api.http.ContentTypes
import play.api.mvc._
import scala.Some

trait ComponentSets extends Controller with ComponentUrls {

  private lazy val logger = Logger("container.component.sets")

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

  override def cssUrl(context: String, components: Seq[Component]): String = url(context, components, "css")

  override def jsUrl(context: String, components: Seq[Component]): String = url(context, components, "js")

  private def url(context: String, components: Seq[Component], suffix: String): String = {
    ComponentUrlDirective.unapply(components.map(_.componentType), allComponents) match {
      case Some(path) => routes.ComponentSets.resource(context, path, suffix).url
      case _ => "?"
    }
  }
}

trait DefaultComponentSets extends ComponentSets {
  val editorGenerator: SourceGenerator = new EditorGenerator()
  val playerGenerator: SourceGenerator = new PlayerGenerator()
  val catalogGenerator: SourceGenerator = new CatalogGenerator()
}
