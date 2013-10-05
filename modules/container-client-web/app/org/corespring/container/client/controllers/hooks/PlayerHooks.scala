package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.views.txt.js.PlayerServices
import play.api.Logger
import play.api.mvc.{AnyContent, Action}


trait PlayerHooks extends BaseHooks {

  val log = Logger("player.hooks")

  def name = "player"

  override def services(sessionId:String) : Action[AnyContent] = builder.loadServices(sessionId) { request : PlayerRequest[AnyContent] =>
    import org.corespring.container.client.controllers.resources.routes._
    Ok(PlayerServices(ngModule, Session.loadEverything(sessionId), Session.submitAnswers(sessionId))).as("text/javascript")
  }

  override def componentsJs(sessionId: String): Action[AnyContent] = builder.loadComponents(sessionId) {
    request: PlayerRequest[AnyContent] =>
      log.debug(s"load js for session $sessionId")
      val typesUsed = componentTypes(request.item)
      val usedComponents = loadedComponents.filter(c => typesUsed.exists(t => c.matchesType(t)))
      componentsToResource(usedComponents, (c) => wrapJs(c.org, c.name, c.client.render), "text/javascript")
  }

  override def componentsCss(sessionId: String):  Action[AnyContent] = builder.loadComponents(sessionId) {
    request =>
      log.debug(s"load css for session $sessionId")
      val typesUsed = componentTypes(request.item)
      val usedComponents = loadedComponents.filter(c => typesUsed.exists(t => c.matchesType(t)))
      componentsToResource(usedComponents, _.client.css.getOrElse(""), "text/css")
  }

}
