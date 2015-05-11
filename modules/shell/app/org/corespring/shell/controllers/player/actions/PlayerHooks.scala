package org.corespring.shell.controllers.player.actions

import com.mongodb.casbah.commons.MongoDBObject
import org.bson.types.ObjectId
import org.corespring.container.client.controllers.{ AssetType, Assets }

import scala.concurrent.Future

import org.corespring.container.client.hooks.{ PlayerHooks => ContainerPlayerHooks }
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

  private def toItemId(json: JsValue): Option[String] = (json \ "itemId").asOpt[String]

  override def load(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future {
    val item: Validation[String, JsValue] = for {
      s <- sessionService.load(id).toSuccess(s"can't find session with id: $id")
      itemId <- toItemId(s).toSuccess(s"error converting string to item id: $s")
      i <- itemService.load(itemId).toSuccess(s"can't load item with id: $itemId")
    } yield {
      i
    }
    item.leftMap(s => (500, s)).toEither
  }

  override def createSessionForItem(itemId: String)(implicit header: RequestHeader): Future[Either[(Int, String), (JsValue,JsValue)]] = Future {

    val settings = Json.obj(
      "maxNoOfAttempts" -> JsNumber(2),
      "showFeedback" -> JsBoolean(true),
      "highlightCorrectResponse" -> JsBoolean(true),
      "highlightUserResponse" -> JsBoolean(true),
      "isFinished" -> JsBoolean(false))

    val session = Json.obj("settings" -> settings, "itemId" -> JsString(itemId), "attempts" -> JsNumber(0))

    sessionService.create(session).map {
      oid =>
        itemService.load(itemId).map{ item =>
          val withId = session ++ Json.obj("id" -> oid.toString)
          Right((withId, item))
        }.getOrElse(Left(NOT_FOUND -> s"Can't find item with id $itemId"))
    }.getOrElse(Left(BAD_REQUEST -> "Error creating session"))
  }

  override def loadSessionAndItem(sessionId: String)(implicit header: RequestHeader): Future[Either[(Int, String), (JsValue, JsValue)]] = Future {
    val out = for {
      session <- sessionService.load(sessionId)
      itemId <- (session \ "itemId").asOpt[String]
      item <- itemService.load(itemId)
    } yield (session -> item)

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

}
