package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.ComponentBundler
import org.corespring.container.client.controllers.apps.componentEditor.ComponentEditorLaunchingController
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.ComponentEditorRenderer
import play.api.Mode.Mode
import play.api.mvc._

class ComponentEditor(
  val containerContext: ContainerExecutionContext,
  val renderer: ComponentEditorRenderer,
  val bundler: ComponentBundler,
  val mode: Mode) extends Controller with ComponentEditorLaunchingController {

  def load(componentType: String) = Action.async { request => componentEditorResult(componentType, request) }

}
