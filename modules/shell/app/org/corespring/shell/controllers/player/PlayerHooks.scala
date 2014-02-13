package org.corespring.shell.controllers.player

import org.corespring.container.client.actions.{PlayerActions => ContainerPlayerActions}
import org.corespring.container.client.controllers.hooks.{PlayerHooks => ContainerPlayerHooks}
import org.corespring.mongo.json.services.MongoService
import play.api.mvc._
import org.corespring.shell.controllers.player.actions.PlayerActions

trait PlayerHooks extends ContainerPlayerHooks {

  def itemService: MongoService

  def sessionService: MongoService

  override def actions: ContainerPlayerActions[AnyContent] = new PlayerActions{
    override def itemService: MongoService = ???

    override def sessionService: MongoService = ???
  }

}
