package org.corespring.container.client.controllers

import org.corespring.container.components.model.dependencies.ComponentSplitter
import org.corespring.container.components.model.{ Interaction }
import play.api.Logger
import play.api.mvc.{ Action, Controller }

trait Icons extends Controller with ComponentSplitter {

  private lazy val logger = Logger("icons")

  val Split = """(.*?)-(.*)""".r

  def icon(iconName: String) = Action {
    request =>

      def matchingComponent(c: Interaction) = {
        val Split(org, name) = iconName
        val matches = c.id.name == name && c.id.org == org
        logger.debug(s"matches: $matches")
        matches
      }

      val bytes: Option[Array[Byte]] = interactions.find(matchingComponent).map(_.icon).flatten

      bytes.map {
        b =>
          Ok(b).as("image/png")
      }.getOrElse(NotFound(""))
  }
}
