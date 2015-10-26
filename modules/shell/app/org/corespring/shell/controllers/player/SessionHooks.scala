package org.corespring.shell.controllers.player

import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks.{ SessionHooks => ContainerSessionHooks, FullSession, SaveSession, SessionOutcome }
import org.corespring.mongo.json.services.MongoService
import org.corespring.container.logging.ContainerLogger
import play.api.http.Status._
import play.api.libs.json.{ JsObject, Json, JsValue }
import play.api.mvc._

import scala.concurrent.{ ExecutionContext, Future }

trait SessionHooks extends ContainerSessionHooks {

  val logger = ContainerLogger.getLogger("SessionHooks")

  def sessionService: MongoService

  def itemService: MongoService

  private def isSecure(request: RequestHeader): Boolean = request.session.get("corespring.player.secure").map(_ == "true").getOrElse(false)

  private def isComplete(session: JsValue): Boolean = (session \ "isComplete").asOpt[Boolean].getOrElse(false)

  private def handleSessionOutcome(id: String)(implicit header: RequestHeader): Either[StatusMessage, SessionOutcome] = {
    val result = for {
      session <- sessionService.load(id)
      itemId <- (session \ "itemId").asOpt[String]
      item <- itemService.load(itemId)
    } yield {
      logger.trace(s"[handleSessionOutcomeRequest] session: $session")
      SessionOutcome(item, session, isSecure(header), isComplete(session))
    }
    result.map(Right(_)).getOrElse {

      logger.trace(s"load session: ${sessionService.load(id)}")
      Left(BAD_REQUEST -> "Error handling outcome request")
    }
  }

  override def getScore(id: String)(implicit header: RequestHeader): Either[StatusMessage, SessionOutcome] = handleSessionOutcome(id)(header)

  override def loadOutcome(id: String)(implicit header: RequestHeader): Either[StatusMessage, SessionOutcome] =
    handleSessionOutcome(id)(header)

  override def loadItemAndSession(id: String)(implicit header: RequestHeader): Either[StatusMessage, FullSession] = {
    val result = for {
      session <- sessionService.load(id)
      itemId <- (session \ "itemId").asOpt[String]
      item <- itemService.load(itemId)
    } yield {
      val out: JsValue = Json.obj("item" -> item, "session" -> session)
      FullSession(out, isSecure(header))
    }
    result.map(Right(_)).getOrElse(Left(BAD_REQUEST -> ""))
  }

  override def load(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = Future {
    sessionService.load(id).map {
      json =>
        Right(json)
    }.getOrElse(Left(NOT_FOUND -> s"Can't find a session with id: $id"))
  }

  override def save(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, SaveSession]] = Future {
    logger.debug(s"save session: $id")
    val result = for {
      session <- sessionService.load(id)
    } yield {
      SaveSession(session, isSecure(header), isComplete(session), sessionService.save(_, _))
    }
    result.map(Right(_)).getOrElse(Left(BAD_REQUEST -> ""))
  }
}

