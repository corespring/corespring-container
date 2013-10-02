package org.corespring.shell.impl

import org.corespring.container.controllers.Session
import org.corespring.container.player.actions.{SessionRequest, SessionActionBuilder}
import play.api.mvc.{Action, Result, AnyContent}
import play.api.Logger

trait PlayerSession extends Session {

  private lazy val logger = Logger("player.session")

  def sessionService: MongoService

  def sessionActions: SessionActionBuilder[AnyContent] = new SessionActionBuilder[AnyContent] {
    def load(id: String)(block: (SessionRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        logger.debug(s"load $id")
        sessionService.load(id).map {
          json =>
            block(SessionRequest(json, request))
        }.getOrElse(NotFound(s"Can't find a session with id: $id"))
    }

    def save(id: String)(block: (SessionRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>

        logger.debug(s"save $id")

        val savedJson = for {
          json <- request.body.asJson
          saved <- sessionService.save(id, json)
        } yield saved

        savedJson.map {
          savedJson =>
            block(SessionRequest(savedJson, request))
        }.getOrElse(NotFound(s"Can't save $id"))

    }
  }


}
