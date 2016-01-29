package org.corespring.container.client.controllers.launcher.player

import org.corespring.container.client.controllers.launcher._
import play.api.mvc._

trait PlayerLauncher extends Launcher {

  def componentEditorJs = Action.async { implicit request =>
    hooks.componentEditorJs.map { err =>
      ComponentEditor(playerConfig, request).result
    }
  }

  def editorJs = Action.async { implicit request =>
    hooks.editorJs.map { implicit js =>
      ItemEditors(playerConfig, request).result
    }
  }

  def catalogJs = Action.async { implicit request =>
    hooks.catalogJs.map { implicit js =>
      Catalog(playerConfig, request).result
    }
  }

  def playerJs = Action.async { implicit request =>
    hooks.playerJs.map { implicit js =>
      logger.debug(s"playerJs - isSecure=${js.isSecure}, path=${request.path}, queryString=${request.rawQueryString}")
      Player(playerConfig, request, js).result
    }
  }

}

