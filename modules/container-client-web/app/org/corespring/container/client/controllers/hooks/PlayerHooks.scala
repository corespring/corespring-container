package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.{ClientHooksActionBuilder, PlayerRequest}
import org.corespring.container.client.views.txt.js.PlayerServices
import play.api.Logger
import play.api.mvc.{AnyContent, Action}


trait PlayerHooks extends BaseHooks[ClientHooksActionBuilder[AnyContent]] {

  val log = Logger("player.hooks")

  def name = "player"

  override def services(sessionId:String) : Action[AnyContent] = builder.loadServices(sessionId) { request : PlayerRequest[AnyContent] =>
    import org.corespring.container.client.controllers.resources.routes._
    Ok(PlayerServices(ngModule, Session.loadEverything(sessionId), Session.submitSession(sessionId))).as("text/javascript")
  }

  override def componentsJs(sessionId: String): Action[AnyContent] = builder.loadComponents(sessionId) {
    request: PlayerRequest[AnyContent] =>
      log.debug(s"load js for session $sessionId")
      val typesUsed = componentTypes(request.item)
      val usedComponents = uiComponents.filter(c => typesUsed.exists(t => c.matchesType(t)))
      componentsToResource(usedComponents, (c) => wrapJs(c.org, c.name, c.client.render), "text/javascript")
  }

  override def componentsCss(sessionId: String):  Action[AnyContent] = builder.loadComponents(sessionId) {
    request =>
      log.debug(s"load css for session $sessionId")
      val typesUsed = componentTypes(request.item)
      val usedComponents = uiComponents.filter(c => typesUsed.exists(t => c.matchesType(t)))
      componentsToResource(usedComponents, _.client.css.getOrElse(""), "text/css")
  }

  def createSessionForItem(itemId: String): Action[AnyContent] = builder.createSessionForItem(itemId) {
    request =>
      //TODO: How to get this path accurately - atm will only support one level of nesting of the routes file?
      val PathRegex = s"""/(.*?)/.*/$itemId.*""".r
      val PathRegex(root) = request.path
      val url = s"/$root/${request.sessionId}/player.html"
      SeeOther(url)
  }
}
