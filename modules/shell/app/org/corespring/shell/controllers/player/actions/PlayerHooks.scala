package org.corespring.shell.controllers.player.actions

import com.mongodb.casbah.commons.MongoDBObject
import org.bson.types.ObjectId
import org.corespring.container.client.controllers.{ AssetType, Assets }

import org.corespring.container.client.hooks.{ PlayerHooks => ContainerPlayerHooks, LoadHook }
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.shell.services.{ ItemService, SessionService }
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.Future

class PlayerHooks(
  sessionService: SessionService,
  assets: Assets,
  itemService: ItemService,
  val containerContext: ContainerExecutionContext) extends ContainerPlayerHooks {

  import play.api.http.Status._

  def playerSkin: JsObject = Json.obj(
    "colors" -> Json.obj(
      "correct-background" -> "#4aaf46",
      "correct-foreground" -> "#f8ffe2",
      "partially-correct-background" -> "#c1e1ac",
      "incorrect-background" -> "#fcb733",
      "incorrect-foreground" -> "#fbf2e3",
      "hide-show-background" -> "#bce2ff",
      "hide-show-foreground" -> "#1a9cff",
      "warning-background" -> "#464146",
      "warning-foreground" -> "#ffffff",
      "warning-block-background" -> "#e0dee0",
      "warning-block-foreground" -> "#f8f6f6"),
    "iconSet" -> "emoji")

  override def createSessionForItem(itemId: String)(implicit header: RequestHeader): Future[Either[(Int, String), (JsValue, JsValue, JsValue)]] = Future {

    val settings = Json.obj(
      "maxNoOfAttempts" -> JsNumber(2),
      "showFeedback" -> JsBoolean(true),
      "highlightCorrectResponse" -> JsBoolean(true),
      "highlightUserResponse" -> JsBoolean(true),
      "isFinished" -> JsBoolean(false))

    val session = Json.obj("settings" -> settings, "itemId" -> itemId, "attempts" -> 0)

    sessionService.create(session).map {
      oid =>
        itemService.load(itemId).map { item =>
          val withId = session ++ Json.obj("id" -> oid.toString)
          Right((withId, item, playerSkin))
        }.getOrElse(Left(NOT_FOUND -> s"Can't find item with id $itemId"))
    }.getOrElse(Left(BAD_REQUEST -> "Error creating session"))
  }

  override def loadSessionAndItem(sessionId: String)(implicit header: RequestHeader): Future[Either[(Int, String), (JsValue, JsValue, JsValue)]] = Future {
    val out = for {
      session <- sessionService.load(sessionId)
      itemId <- (session \ "itemId").asOpt[String]
      item <- itemService.load(itemId)
    } yield {
      (session.as[JsObject] ++ Json.obj("id" -> sessionId), item, playerSkin)
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

  override def archiveCollectionId: String = "archiveId"
}
