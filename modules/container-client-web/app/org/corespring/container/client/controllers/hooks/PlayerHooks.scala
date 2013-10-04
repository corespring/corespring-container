package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.views.txt.js.PlayerServices
import play.api.Logger
import play.api.mvc.{AnyContent, Action}


trait PlayerHooks extends BaseHooks {

  val log = Logger("player.hooks")

  def names = new AssetNames {
    def namespace = "player.services"
    def services = "player-services.js"
    def components = "player-components.js"
  }

  override def services(sessionId:String) : Action[AnyContent] = builder.loadServices(sessionId) { request : PlayerRequest[AnyContent] =>
    import org.corespring.container.client.controllers.resources.routes._
    Ok(PlayerServices(names.namespace, Session.loadEverything(sessionId), Session.submitAnswers(sessionId))).as("text/javascript")
  }

  override def components(sessionId: String): Action[AnyContent] = builder.loadComponents(sessionId) {
    request: PlayerRequest[AnyContent] =>
      log.debug(s"load js for session $sessionId")
      val typesUsed = componentTypes(request.item)
      val usedComponents = loadedComponents.filter(c => typesUsed.exists(t => c.matchesType(t)))
      val js = usedComponents.map(c => wrapJs(c.org, c.name, c.client.render)).mkString("\n")
      Ok(js).as("text/javascript")
  }

}
