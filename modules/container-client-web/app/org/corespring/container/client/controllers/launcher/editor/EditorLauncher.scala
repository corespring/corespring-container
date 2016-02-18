package org.corespring.container.client.controllers.launcher.editor

import org.corespring.container.client.controllers.launcher.{ JsBuilder, ItemEditors, Launcher }
import play.api.mvc.Action

trait EditorLauncher extends Launcher {

  def builder: JsBuilder

  def editorJs = Action.async { implicit request =>
    hooks.editorJs.map { implicit js =>
      ItemEditors(playerConfig, request, builder).result
    }
  }
}
