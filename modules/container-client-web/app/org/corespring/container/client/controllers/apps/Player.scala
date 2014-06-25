package org.corespring.container.client.controllers.apps

import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.views.txt.js.PlayerServices
import play.api.Logger
import play.api.mvc._

import scala.concurrent.Future

trait Player
  extends PlayerItemTypeReader
  with AppWithServices[PlayerHooks]
  with JsModeReading {

  import org.corespring.container.client.controllers.apps.routes.{ Player => PlayerRoutes }

  override def context: String = "player"

  lazy val logger = Logger("container.player")

  override def servicesJs = {
    import org.corespring.container.client.controllers.resources.routes._
    PlayerServices(
      "player.services",
      Session.loadEverything(":id"),
      Session.saveSession(":id"),
      Session.getScore(":id"),
      Session.completeSession(":id"),
      Session.loadOutcome(":id")).toString
  }

  def createSessionForItem(itemId: String): Action[AnyContent] = Action.async { implicit request =>
    hooks.createSessionForItem(itemId).map(handleSuccess { sessionId =>
      val file = request.queryString.get("file").map(_(0)).getOrElse("index.html")
      val url = s"${PlayerRoutes.loadPlayerForSession(sessionId).url}?file=$file&mode=gather"
      SeeOther(url)
    })
  }

  def loadPlayerForSession(sessionId: String) = Action.async { implicit request =>
    hooks.loadPlayerForSession(sessionId).flatMap { maybeError =>

      maybeError.map { sm =>
        val (code, msg) = sm
        Future(Ok(org.corespring.container.client.views.html.error.main(code, msg)))
      }.getOrElse {

        def playerPage(request: Request[AnyContent]) = {

          val jsMode = getJsMode(request)
          logger.trace(s"js mode: $jsMode")
          def has(n: String) = request.path.contains(n) || request.getQueryString("file") == Some(n)
          if (has("container-player.html")) s"container-player.$jsMode.html" else s"player.$jsMode.html"
        }

        val page = playerPage(request)
        logger.debug(s"[loadPlayerForSession] $sessionId - loading $page from /container-client")
        controllers.Assets.at("/container-client", page)(request)
      }
    }
  }

  override def additionalScripts: Seq[String] = Seq(PlayerRoutes.services().url)

}
