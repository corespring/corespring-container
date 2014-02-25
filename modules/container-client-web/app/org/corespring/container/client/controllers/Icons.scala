package org.corespring.container.client.controllers

import org.corespring.container.components.model.{ UiComponent, Component }
import play.api.Logger
import play.api.mvc.{ Action, Controller }

trait Icons extends Controller {

  private lazy val logger = Logger("icons")

  def loadedComponents: Seq[Component]

  def uiComponents: Seq[UiComponent] = loadedComponents.filter(uic => uic.isInstanceOf[UiComponent]).map(_.asInstanceOf[UiComponent])

  val Split = """(.*?)-(.*)""".r

  def icon(iconName: String) = Action {
    request =>

      def matchingComponent(c: UiComponent) = {
        val Split(org, name) = iconName
        val matches = c.id.name == name && c.id.org == org
        logger.debug(s"matches: $matches")
        matches
      }

      val bytes: Option[Array[Byte]] = uiComponents.find(matchingComponent).map(_.icon).flatten

      bytes.map {
        b =>
          Ok(b).as("image/png")
      }.getOrElse(NotFound(""))
  }
}
