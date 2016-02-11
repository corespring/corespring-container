package org.corespring.container.client.controllers.apps

import org.corespring.container.client.apps.ComponentEditor
import play.api.mvc.{ Action, Controller }

import scala.concurrent.Future

class ComponentEditorController extends Controller {

  def load(componentType: String) = Action.async { request =>
    Future {
      val componentEditor = ComponentEditor(componentType)
      Ok(componentEditor.html)
    }
  }
}
