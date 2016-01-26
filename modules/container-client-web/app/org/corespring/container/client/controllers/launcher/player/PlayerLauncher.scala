package org.corespring.container.client.controllers.launcher.player

import org.corespring.container.client.controllers.launcher.Launcher
import play.api.mvc._

trait PlayerLauncher extends Launcher {

  def editorJs = Action.async { implicit request =>
    hooks.editorJs.map { implicit js =>
      val config = mkPaths(Paths.editors)
      make(Seq(
        NameAndSrc.draftEditor,
        NameAndSrc.itemEditor,
        NameAndSrc.componentEditor
      ), config, Definitions.editors)
    }
  }

  def catalogJs = Action.async { implicit request =>
    hooks.catalogJs.map { implicit js =>
      make(NameAndSrc.catalog, mkPaths(Paths.catalog), Definitions.catalog)
    }
  }

  def playerJs = Action.async { implicit request =>
    hooks.playerJs.map { implicit js =>
      logger.debug(s"playerJs - isSecure=${js.isSecure}, path=${request.path}, queryString=${request.rawQueryString}")
      make(NameAndSrc.player, mkPaths(Paths.player), Definitions.player(js.isSecure))
    }
  }

}

