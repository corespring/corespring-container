package org.corespring.container.client.controllers

import org.corespring.container.components.model.dependencies.ComponentSplitter
import org.corespring.container.components.model.{ ComponentInfo, Widget, Interaction }
import org.corespring.container.logging.ContainerLogger
import play.api.mvc.{ Action, Controller }

import scala.concurrent.Future

trait Icons extends Controller with ComponentSplitter {

  private lazy val logger = ContainerLogger.getLogger("Icons")

  val Split = """(.*?)-(.*)""".r

  def icon(iconName: String) = Action.async {
    implicit request => Future {

      def matchingComponentInfo(c: ComponentInfo) = {
        val Split(org, name) = iconName
        val matches = c.id.name == name && c.id.org == org
        logger.debug(s"matches: $matches")
        matches
      }

      val bytes: Option[Array[Byte]] =
        interactions.find(matchingComponentInfo).map(_.icon) match {
          case Some(icon) => icon
          case _ => widgets.find(matchingComponentInfo).map(_.icon).get
        }

      bytes.map {
        b =>
          Ok(b).as("image/png")
      }.getOrElse(NotFound(""))
    }
  }
}
