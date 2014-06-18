package org.corespring.shell.controllers.player.actions

import org.corespring.container.client.actions.{ PlayerHooks => ContainerPlayerHooks }
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.SessionKeys
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.{ ExecutionContext, Future }
import scalaz.Validation

trait PlayerHooks extends ContainerPlayerHooks {

  import play.api.http.Status._

  import scalaz.Scalaz._

  implicit def ec: ExecutionContext

  def sessionService: MongoService

  def itemService: MongoService

  private def toItemId(json: JsValue): Option[String] = (json \ "itemId").asOpt[String]

  private def load(id: String)(implicit header: RequestHeader) = Future {
    val item: Validation[String, JsValue] = for {
      s <- sessionService.load(id).toSuccess(s"can't find session with id: $id")
      itemId <- toItemId(s).toSuccess(s"error converting string to item id: $s")
      i <- itemService.load(itemId).toSuccess(s"can't load item with id: $itemId")
    } yield {
      i
    }

    item.leftMap(s => (500, s)).toEither
  }

  override def loadConfig(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = load(id)

  override def loadServices(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = load(id)

  override def loadComponents(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = load(id)

  override def createSessionForItem(itemId: String)(implicit header: RequestHeader): Future[Either[(Int, String), String]] = Future {

    val settings = Json.obj(
      "maxNoOfAttempts" -> JsNumber(2),
      "showFeedback" -> JsBoolean(true),
      "highlightCorrectResponse" -> JsBoolean(true),
      "highlightUserResponse" -> JsBoolean(true),
      "isFinished" -> JsBoolean(false))

    val session = Json.obj("settings" -> settings, "itemId" -> JsString(itemId), "attempts" -> JsNumber(0))

    sessionService.create(session).map {
      oid =>
        Right(oid.toString)
    }.getOrElse(Left(BAD_REQUEST -> "Error creating session"))
  }

  override def loadPlayerForSession(sessionId: String)(implicit header: RequestHeader): Future[Option[(Int, String)]] = Future {
    val s = header.session.get(SessionKeys.failLoadPlayer)
    s.map(_ => 1001 -> "Some error occured")
  }

}
