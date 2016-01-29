package org.corespring.container.client.controllers.launcher.editor

import org.corespring.container.client.controllers.launcher.{ItemEditors, Launcher}
import play.api.mvc.Action

trait EditorLauncher extends Launcher {

  def editorJs = Action.async { implicit request =>
    hooks.editorJs.map { implicit js =>
      ItemEditors(playerConfig, request).result
    }
  }

}
