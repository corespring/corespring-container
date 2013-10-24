package org.corespring.shell.impl.controllers.player

import org.corespring.container.client.actions.{SubmitAnswersRequest, FullSessionRequest, SessionActionBuilder}
import org.corespring.shell.impl.services.MongoService
import play.api.Logger
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{Action, Result, AnyContent}
import org.corespring.container.client.controllers.resources.Session

trait ClientSessionImpl extends Session {

  def sessionService: MongoService

  def itemService: MongoService

  def builder: SessionActionBuilder[AnyContent] = new SessionActionBuilder[AnyContent] {
    def load(id: String)(block: (FullSessionRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        logger.debug(s"load $id")
        sessionService.load(id).map {
          json =>
            block(FullSessionRequest(json, request))
        }.getOrElse(NotFound(s"Can't find a session with id: $id"))
    }

    def submitAnswers(id: String)(block: (SubmitAnswersRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>

        logger.debug(s"submit answers for: $id")

        val result = for {
          session <- sessionService.load(id)
          itemId <- (session \ "itemId").asOpt[String]
          item <- itemService.load(itemId)
        } yield {
          val out: JsValue = Json.obj("item" -> item, "session" -> session)
          SubmitAnswersRequest(out, sessionService.save, request)
        }
        result.map {
          r =>
            block(r)
        }.getOrElse(BadRequest("??"))
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
