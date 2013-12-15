package org.corespring.shell.impl.controllers.player

import org.corespring.container.client.actions._
import org.corespring.container.client.controllers.resources.Session
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{Request, Action, Result, AnyContent}
import org.corespring.mongo.json.services.MongoService

trait ClientSessionImpl extends Session {

  def sessionService: MongoService

  def itemService: MongoService

  def builder: SessionActionBuilder[AnyContent] = new SessionActionBuilder[AnyContent] {

    private def isSecure(request:Request[AnyContent]) : Boolean  = request.session.get("corespring.player.secure").map(_ == "true").getOrElse(false)

    private def isComplete(session:JsValue) : Boolean = (session \ "isComplete").asOpt[Boolean].getOrElse(false)

    def load(id: String)(block: (FullSessionRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        logger.debug(s"load $id")
        sessionService.load(id).map {
          json =>
            block(FullSessionRequest(json, isSecure(request), request))
        }.getOrElse(NotFound(s"Can't find a session with id: $id"))
    }

    def submitAnswers(id: String)(block: (SubmitSessionRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>

        logger.debug(s"submit answers for: $id")

        val result = for {
          session <- sessionService.load(id)
          itemId <- (session \ "itemId").asOpt[String]
          item <- itemService.load(itemId)
        } yield {
          val out: JsValue = Json.obj("item" -> item, "session" -> session)
          SubmitSessionRequest(out, sessionService.save, request)
        }
        result.map {
          r =>
            block(r)
        }.getOrElse(BadRequest("??"))
    }

    def save(id: String)(block: (SaveSessionRequest[AnyContent]) => Result): Action[AnyContent] = Action{
      request : Request[AnyContent] =>
      logger.debug(s"save session: $id")

      val result = for {
        session <- sessionService.load(id)
      } yield {
        SaveSessionRequest(session, isSecure(request), isComplete(session) ,sessionService.save, request)
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
          FullSessionRequest(out, isSecure(request), request)
        }
        result.map {
          r =>
            block(r)
        }.getOrElse(BadRequest("??"))
    }

    def loadOutcome(id: String)(block: (SessionOutcomeRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        val result = for {
          session <- sessionService.load(id)
          itemId <- (session \ "itemId").asOpt[String]
          item <- itemService.load(itemId)
        } yield {
          SessionOutcomeRequest(item, session, isSecure(request), isComplete(session), request)
        }

        result.map{ r =>
          block(r)
        }.getOrElse(BadRequest("Error loading outcome"))
    }
  }


}
