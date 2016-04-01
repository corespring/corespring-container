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

  val playerSkin = Json.obj(
    "colors" -> Json.obj(
      "correct-color" -> "#ff0",
      "incorrect-color" -> "#0ff",
      "feedback-correct-background" -> "#4AAF46",
      "feedback-correct-foreground" -> "#F8FFE2",
      "feedback-incorrect-background" -> "#FCB733",
      "feedback-incorrect-foreground" -> "#FBF2E3",
      "feedback-partially-correct-background" -> "#C1E1AC",
      "feedback-partially-correct-foreground" -> "#52654F",
      "choice-correct-border" -> "#C7E2C7",
      "choice-correct-inner" -> "#86A785",
      "choice-incorrect-border" -> "#FFCC99",
      "choice-incorrect-inner" -> "#FBE7B7",
      "choice-selected-border" -> "#A2D4F2",
      "choice-selected-inner" -> "#404B9B",
      "choice-disabled-border" -> "#A2D4F2",
      "choice-disabled-inner" -> "#404B9B"),
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
