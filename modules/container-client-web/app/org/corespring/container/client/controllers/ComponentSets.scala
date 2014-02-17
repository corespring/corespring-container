package org.corespring.container.client.controllers

import org.corespring.container.client.component._
import org.corespring.container.components.model.Component
import play.api.Logger
import play.api.http.ContentTypes
import play.api.mvc.{EssentialAction, AnyContent, Action, Controller}

trait ComponentSets extends Controller with ComponentUrls {

  private lazy val logger = Logger("container.component.sets")

  def allComponents: Seq[Component]

  def resource(context: String, directive: String, suffix: String): EssentialAction = {

    logger.debug(s"[resource] : $directive")
    val types: Seq[String] = ComponentUrlDirective(directive, allComponents)
    generate(context, types.map(t => allComponents.find(_.componentType == t)).flatten, suffix)
  }

  def generate(context: String, components: Seq[Component], suffix: String): Action[AnyContent] = Action {
    request =>

      logger.trace(s"context: $context, comps: ${components.map(_.componentType).mkString(",")}")

      def gen(generator: SourceGenerator) = suffix match {
        case "js" => generator.js(components.toSeq)
        case "css" => generator.css(components.toSeq)
        case _ => ""
      }

      val out = context match {
        case "editor" => gen(new EditorGenerator())
        case "player" => gen(new PlayerGenerator())
        case "rig" => gen(new PlayerGenerator())
        case _ => throw new RuntimeException("Error")
      }

      val contentType = suffix match {
        case "js" => ContentTypes.JAVASCRIPT
        case "css" => ContentTypes.CSS
        case _ => throw new RuntimeException(s"Unknown suffix: $suffix")
      }

      Ok(out).as(contentType)
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

trait DevComponentSets extends ComponentSets with ComponentUrls {
}

