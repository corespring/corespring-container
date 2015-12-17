package org.corespring.container.client.controllers.launcher.player

import org.corespring.container.client.controllers.launcher.Launcher
import play.api.mvc._

trait PlayerLauncher extends Launcher {

  def editorJs = Action.async { implicit request =>
    hooks.editorJs.map { implicit js =>
      val config = mkPaths(Paths.editors)
      make(Seq(draftEditorNameAndSrc, itemEditorNameAndSrc), config, Definitions.editors)
    }
  }

  def catalogJs = Action.async { implicit request =>
    hooks.catalogJs.map { implicit js =>
      make(catalogNameAndSrc, mkPaths(Paths.catalog), Definitions.catalog)
    }
  }

  def playerJs = Action.async { implicit request =>
    hooks.playerJs.map { implicit js =>
      logger.debug(s"playerJs - isSecure=${js.isSecure}, path=${request.path}, queryString=${request.rawQueryString}")
      make(playerNameAndSrc, mkPaths(Paths.player), Definitions.player(js.isSecure))
    }
  }

}

