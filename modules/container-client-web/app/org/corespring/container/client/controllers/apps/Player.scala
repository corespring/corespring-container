package org.corespring.container.client.controllers.apps

import scala.Some
import scala.concurrent.{Await, Future}

import org.corespring.container.client.actions.PlayerActions
import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.views.txt.js.PlayerServices
import play.api.Logger
import play.api.mvc._

trait Player
  extends PlayerItemTypeReader
  with AppWithServices[PlayerActions[AnyContent]]
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

  def createSessionForItem(itemId: String): Action[AnyContent] = actions.createSessionForItem(itemId) {
    request =>
      val file = request.queryString.get("file").map(_(0)).getOrElse("index.html")
      val url = s"${PlayerRoutes.loadPlayerForSession(request.sessionId).url}?file=$file&mode=gather"
      SeeOther(url)
  }

  def loadPlayerForSession(sessionId: String) = actions.loadPlayerForSession(sessionId) {
    (code: Int, msg: String) =>
      Ok(org.corespring.container.client.views.html.error.main(code, msg))
  } {
    request =>

      def playerPage(request: Request[AnyContent]) = {

        val jsMode = getJsMode(request)
        logger.trace(s"js mode: $jsMode")
        def has(n: String) = request.path.contains(n) || request.getQueryString("file") == Some(n)
        if (has("container-player.html")) s"container-player.$jsMode.html" else s"player.$jsMode.html"
      }

      val page = playerPage(request)
      import scala.concurrent.duration._
      logger.debug(s"[loadPlayerForSession] $sessionId - loading $page from /container-client")
      val f: Future[SimpleResult] = controllers.Assets.at("/container-client", page)(request)
      Await.result(f, 3.seconds)
  }

  override def additionalScripts: Seq[String] = Seq(PlayerRoutes.services().url)

}
