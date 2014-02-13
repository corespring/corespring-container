package org.corespring.container.client.controllers

import org.corespring.container.client.component._
import org.corespring.container.client.views.txt.js.PlayerServices

trait Player extends PlayerItemTypeReader with AppWithServices{
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

  override def additionalScripts : Seq[String] = Seq(org.corespring.container.client.controllers.routes.Player.services().url)
}


