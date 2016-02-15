package org.corespring.container.client.controllers.apps

import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.componentEditor.ComponentEditorRenderer
import play.api.mvc.{ Action, Controller }

class ComponentEditorController(
  containerExecutionContext: ContainerExecutionContext,
  renderer: ComponentEditorRenderer) extends Controller {

  implicit val ec = containerExecutionContext.context

  def load(componentType: String) = Action.async { request =>
    renderer.render().map { html =>
      Ok(html)
    }
  }
}
