package org.corespring.shell.impl.controllers.player

import org.corespring.container.controllers.Session
import org.corespring.container.player.actions.{FullSessionRequest, SessionRequest, SessionActionBuilder}
import org.corespring.shell.impl.services.MongoService
import play.api.Logger
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{Action, Result, AnyContent}

trait PlayerSession extends Session {

  private lazy val logger = Logger("player.session")

  def sessionService: MongoService

  def itemService: MongoService

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

    def loadEverything(id: String)(block: (FullSessionRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        val result = for {
          session <- sessionService.load(id)
          itemId <- (session \ "itemId").asOpt[String]
          item <- itemService.load(itemId)
        } yield {
          val out: JsValue = Json.obj("item" -> item, "session" -> session)
          FullSessionRequest(out, request)
        }
        result.map {
          r =>
            block(r)
        }.getOrElse(BadRequest("??"))
    }
  }


}
