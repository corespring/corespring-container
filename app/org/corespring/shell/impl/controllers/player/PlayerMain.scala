package org.corespring.shell.impl.controllers.player

import org.corespring.container.player.actions.{PlayerRequest, PlayerActionBuilder}
import org.corespring.shell.impl.services.MongoService
import play.api.mvc.{Action, AnyContent, Result, BodyParser}
import org.corespring.container.controllers.Main

trait PlayerMain extends Main {

  def itemService : MongoService


  val xhtml = """<html><body><h1>Butterflies!</h1></body></html>"""

  def builder : PlayerActionBuilder[AnyContent] = new PlayerActionBuilder[AnyContent] {

    override def playerAction(id:String)(block: (PlayerRequest[AnyContent]) => Result) : Action[AnyContent] = {
      playerAction(play.api.mvc.BodyParsers.parse.anyContent)(id)(block)
    }

    override def playerAction(p: BodyParser[AnyContent])(id:String)(block: (PlayerRequest[AnyContent]) => Result) : Action[AnyContent] = Action { request =>
      itemService.load(id).map{ json =>
        block(PlayerRequest(json, request))
      }.getOrElse(NotFound(s"No item with $id found"))
    }
  }
}
