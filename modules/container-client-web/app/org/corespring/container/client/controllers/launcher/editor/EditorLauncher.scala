package org.corespring.container.client.controllers.launcher.editor

import org.corespring.container.client.controllers.launcher.Launcher
import play.api.mvc.Action

trait EditorLauncher extends Launcher {

  def editorJs = Action.async { implicit request =>
    hooks.editorJs.map { implicit js =>
      val config = mkPaths(Paths.editors)
      make(Seq(NameAndSrc.draftEditor, NameAndSrc.itemEditor, NameAndSrc.componentEditor), config, Definitions.editors)
    }
  }

}
