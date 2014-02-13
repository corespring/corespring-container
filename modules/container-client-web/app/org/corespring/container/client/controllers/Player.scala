package org.corespring.container.client.controllers

import org.corespring.container.client.cache.ContainerCache
import org.corespring.container.client.component._
import org.corespring.container.client.views.txt.js.PlayerServices
import play.api.mvc.Action

trait Player extends PlayerItemTypeReader with App{
  override def context: String = "player"

  def cache : ContainerCache

  def services = {
    Action{
      if(!cache.has("player.services")){
        cache.set("player.services", js.toString )
      }

      cache.get("player.services").map(Ok(_)).getOrElse(NotFound(""))
    }
  }

  private def js = {
    import org.corespring.container.client.controllers.resources.routes._
    PlayerServices(
      "player.services",
      Session.loadEverything(":id"),
      Session.saveSession(":id"),
      Item.getScore(":id"),
      Session.completeSession(":id"),
      Session.loadOutcome(":id")
    )
  }

  override def servicesPath: String = org.corespring.container.client.controllers.routes.Player.services().url
}


