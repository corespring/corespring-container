package org.corespring.shell.controllers.player.actions

import com.mongodb.casbah.commons.MongoDBObject
import org.bson.types.ObjectId
import org.corespring.container.client.controllers.{ AssetType, Assets }

import scala.concurrent.Future

import org.corespring.container.client.hooks.{ PlayerHooks => ContainerPlayerHooks, LoadHook }
import org.corespring.mongo.json.services.MongoService
import play.api.libs.json._
import play.api.mvc._
import scalaz.Validation

trait PlayerHooks extends ContainerPlayerHooks {

  import play.api.http.Status._

  import scalaz.Scalaz._

  def sessionService: MongoService

  def assets: Assets
  def itemService: MongoService

  override def createSessionForItem(itemId: String)(implicit header: RequestHeader): Future[Either[(Int, String), (JsValue, JsValue)]] = Future {

    val settings = Json.obj(
      "maxNoOfAttempts" -> JsNumber(2),
      "showFeedback" -> JsBoolean(true),
      "highlightCorrectResponse" -> JsBoolean(true),
      "highlightUserResponse" -> JsBoolean(true),
      "isFinished" -> JsBoolean(false))

    val session = Json.obj("settings" -> settings, "itemId" -> JsString(itemId), "attempts" -> JsNumber(0))

    sessionService.create(session).map {
      oid =>
        itemService.load(itemId).map { item =>
          val withId = session ++ Json.obj("id" -> oid.toString)
          Right((withId, item))
        }.getOrElse(Left(NOT_FOUND -> s"Can't find item with id $itemId"))
    }.getOrElse(Left(BAD_REQUEST -> "Error creating session"))
  }

  override def loadSession(sessionId: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future {
    val out = for {
      session <- sessionService.load(sessionId)
    } yield {
        session
      }

    out.map(Right(_)).getOrElse(Left(NOT_FOUND -> "Can't find item or session"))
  }

  override def loadSessionAndItem(sessionId: String)(implicit header: RequestHeader): Future[Either[(Int, String), (JsValue, JsValue)]] = Future {
    val out = for {
      session <- sessionService.load(sessionId)
      itemId <- (session \ "itemId").asOpt[String]
      item <- itemService.load(itemId)
    } yield {
      (session.as[JsObject] ++ Json.obj("id" -> sessionId), item)
    }

    out.map(Right(_)).getOrElse(Left(NOT_FOUND -> "Can't find item or session"))
  }

  override def loadFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult = {

    val out = for {
      dbo <- sessionService.collection.findOneByID(new ObjectId(id), MongoDBObject("itemId" -> 1))
      itemId <- Some(dbo.get("itemId").asInstanceOf[String])
      result <- Some(assets.load(AssetType.Item, itemId, path)(request))
    } yield result
    import Results.NotFound
    out.getOrElse(NotFound(""))
  }

  override def loadItemFile(itemId: String, file: String)(implicit header: RequestHeader): SimpleResult = {
    assets.load(AssetType.Item, itemId, file)(header)
  }
}
