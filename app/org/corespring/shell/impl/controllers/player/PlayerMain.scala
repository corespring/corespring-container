package org.corespring.shell.impl.controllers.player

import org.corespring.container.controllers.Main
import org.corespring.container.player.actions.{PlayerRequest, PlayerActionBuilder}
import org.corespring.shell.impl.services.MongoService
import play.api.libs.json.JsValue
import play.api.mvc.{Action, AnyContent, Result, BodyParser}

trait PlayerMain extends Main {

  def itemService: MongoService

  def sessionService: MongoService


  val xhtml = """<html><body><h1>Butterflies!</h1></body></html>"""

  def builder: PlayerActionBuilder[AnyContent] = new PlayerActionBuilder[AnyContent] {

    def toItemId(json: JsValue): Option[String] = (json \ "itemId").asOpt[String]

    def playAction(sessionId: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        val playerRequest: Option[PlayerRequest[AnyContent]] = for {
          s <- sessionService.load(sessionId)
          itemId <- toItemId(s)
          i <- itemService.load(itemId)
        } yield {
          PlayerRequest(i, request, Some(s))
        }
        playerRequest.map(block(_)).getOrElse(BadRequest("Error loading play action"))
    }

    override def playerAction(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = {
      playerAction(play.api.mvc.BodyParsers.parse.anyContent)(id)(block)
    }

    override def playerAction(p: BodyParser[AnyContent])(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        itemService.load(id).map {
          json =>
            block(PlayerRequest(json, request))
        }.getOrElse(NotFound(s"No item with $id found"))
    }
  }
}
