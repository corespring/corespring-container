package org.corespring.shell.controllers.player.actions

import com.mongodb.casbah.commons.MongoDBObject
import org.bson.types.ObjectId
import org.corespring.container.client.controllers.{ AssetType, Assets }
import org.corespring.container.client.hooks.{ LoadHook, PlayerHooks => ContainerPlayerHooks }
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.components.processing.StashProcessor
import org.corespring.shell.services.{ ItemService, SessionService }
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.Future

class PlayerHooks(
  sessionService: SessionService,
  assets: Assets,
  itemService: ItemService,
  stashProcessor: StashProcessor,
  val containerContext: ContainerExecutionContext) extends ContainerPlayerHooks {

  import play.api.http.Status._

  private def addOptionalStash(item: JsValue, session: JsObject): JsObject = {
    stashProcessor.prepareStash(item, session) match {
      case Some(stash) => session ++ Json.obj("components" -> stash)
      case _ => session
    }
  }

  override def createSessionForItem(itemId: String)(implicit header: RequestHeader): Future[Either[(Int, String), (JsValue, JsValue)]] = Future {

    val settings = Json.obj(
      "maxNoOfAttempts" -> JsNumber(2),
      "showFeedback" -> JsBoolean(true),
      "highlightCorrectResponse" -> JsBoolean(true),
      "highlightUserResponse" -> JsBoolean(true),
      "isFinished" -> JsBoolean(false))

    val session = Json.obj("settings" -> settings, "itemId" -> itemId, "attempts" -> 0)

    itemService.load(itemId).map { item =>
      val withStash = addOptionalStash(item, session)
      sessionService.create(withStash).map { oid =>
        val withId = withStash ++ Json.obj("id" -> oid.toString)
        Right((withId, item))
      }.getOrElse(Left(BAD_REQUEST -> "Error creating session"))
    }.getOrElse(Left(NOT_FOUND -> s"Can't find item with id $itemId"))
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

  override def archiveCollectionId: String = "archiveId"
}
