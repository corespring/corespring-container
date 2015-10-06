package org.corespring.container.client.controllers

import play.api.mvc.Action

trait EditorLauncher extends Launcher {

  def editorJs = Action.async { implicit request =>
    hooks.editorJs.map { implicit js =>
      val config = mkPaths(Paths.editors)
      make(Seq(draftEditorNameAndSrc, itemEditorNameAndSrc), config, Definitions.editors)
    }
  }

}
