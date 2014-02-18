package org.corespring.container.client.controllers

import org.corespring.container.client.actions.PlayerActions
import org.corespring.container.client.component._
import org.corespring.container.client.views.txt.js.PlayerServices
import play.api.mvc.{SimpleResult, Request, AnyContent, Action}
import scala.concurrent.{Await, Future}

trait Player extends PlayerItemTypeReader with AppWithServices[PlayerActions[AnyContent]] {
  override def context: String = "player"

  override def servicesJs = {
    import org.corespring.container.client.controllers.resources.routes._
    PlayerServices(
      "player.services",
      Session.loadEverything(":id"),
      Session.saveSession(":id"),
      Item.getScore(":id"),
      Session.completeSession(":id"),
      Session.loadOutcome(":id")
    ).toString
  }


  def createSessionForItem(itemId: String): Action[AnyContent] = actions.createSessionForItem(itemId) {
    request =>
      val file = request.queryString.get("file").map(_(0)).getOrElse("index.html")
      import org.corespring.container.client.controllers.routes.{Player => Routes}
      val url = s"${Routes.loadPlayerForSession(request.sessionId).url}?file=$file&mode=gather"
      SeeOther(url)
  }


  def loadPlayerForSession(sessionId: String) = actions.loadPlayerForSession(sessionId) {
    (code: Int, msg: String) =>
      Ok(org.corespring.container.client.views.html.error.main(code, msg))
  } {
    request =>

      def playerPage(request: Request[AnyContent]) = {
        def has(n: String) = request.path.contains(n) || request.getQueryString("file") == Some(n)
        if (has("container-player.html")) "container-player.html" else "player.html"
      }
      val page = playerPage(request)
      import scala.concurrent.duration._
      val f: Future[SimpleResult] = controllers.Assets.at("/container-client", page)(request)
      Await.result(f, 3.seconds)
  }

  override def additionalScripts: Seq[String] = Seq(org.corespring.container.client.controllers.routes.Player.services().url)
}


