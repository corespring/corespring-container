package org.corespring.container.client.controllers

import play.api.mvc.{Action, Controller}
import org.corespring.container.components.model.Component
import play.api.Logger

trait Icons extends Controller {

  private lazy val logger = Logger("icons")

  def loadedComponents: Seq[Component]

  val Split = """(.*?)-(.*)""".r

  def icon(iconName: String) = Action {
    request =>

      def matchingComponent(c:Component) =  {
        val Split(org, name) = iconName
        val matches = c.name == name && c.org == org
        logger.debug(s"matches: $matches")
        matches
      }

      val bytes: Option[Array[Byte]] = loadedComponents.find(matchingComponent).map(_.icon).flatten

      bytes.map {
        b =>
          Ok(b).as("image/png")
      }.getOrElse(NotFound(""))
  }
}
