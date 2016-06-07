package org.corespring.shell.controllers.editor.actions

import com.mongodb.casbah.commons.MongoDBObject
import org.bson.types.ObjectId
import org.corespring.container.client.controllers.{ AssetType, Assets }
import org.corespring.container.client.hooks.Hooks.ItemAndDefaults
import org.corespring.container.client.hooks.{ UploadResult, DraftEditorHooks => ContainerDraftEditorHooks, ItemEditorHooks => ContainerItemEditorHooks }
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.logging.ContainerLogger
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.DefaultPlayerSkin
import org.corespring.shell.controllers.editor.ItemDraftAssets
import org.corespring.shell.services.{ ItemDraftService, ItemService }
import play.api.Logger
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._

import scala.concurrent.Future
import scala.util.Try

abstract class DraftId[A](val itemId: A, val name: String)

case class ContainerDraftId(override val itemId: ObjectId, override val name: String)
  extends DraftId[ObjectId](itemId, name)

object ContainerDraftId {
  def fromString(s: String): Option[ContainerDraftId] = {
    Try {
      DraftId.fromString[ObjectId, ContainerDraftId](s, (id, name) => {
        ContainerDraftId(new ObjectId(id), name)
      })
    }.toOption
  }
}

object DraftId {
  def fromString[A, D <: DraftId[A]](s: String, build: (String, String) => D): D = {
    val arr = s.split("~")
    if (arr.length == 2) {
      build(arr(0), arr(1))
    } else {
      throw new IllegalArgumentException(s"Invalid draft id format $s. Must be in the form 'itemId~draftName'")
    }
  }

  def dbo[A](id: DraftId[A]) = {
    MongoDBObject("itemId" -> id.itemId, "name" -> id.name)
  }
}

class ItemEditorHooks(
  itemService: ItemService,
  assets: Assets,
  val containerContext: ContainerExecutionContext) extends ContainerItemEditorHooks {

  lazy val logger = ContainerLogger.getLogger("EditorHooks")

  import play.api.http.Status._

  override def load(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), ItemAndDefaults]] = Future {
    itemService.load(id).map { json =>
      Right((json, DefaultPlayerSkin.defaultPlayerSkin))
    }.getOrElse {
      val newId = ObjectId.get
      val data = Json.obj("_id" -> Json.obj("$oid" -> newId.toString))
      val oid = itemService.create(data).get
      require(newId == oid, "the created oid must match the new id")
      Right((Json.obj("item" -> data), DefaultPlayerSkin.defaultPlayerSkin))
    }
  }

  override def deleteFile(id: String, path: String)(implicit header: RequestHeader): Future[Option[(Int, String)]] = assets.delete(AssetType.Item, id, path)(header)

  override def upload(itemId: String, file: String)(predicate: (RequestHeader) => Option[SimpleResult]): BodyParser[Future[UploadResult]] = {

    def shellPredicate(rh: RequestHeader): Option[SimpleResult] = {
      predicate(rh).orElse {
        if (rh.getQueryString("fail").exists(_ == "true")) {
          Some(Results.BadRequest("Fail is in the queryString"))
        } else {
          None
        }
      }
    }

    assets.upload(AssetType.Item, itemId, file)(shellPredicate)
  }

  override def loadFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult = assets.load(AssetType.Item, id, path)(request)

}

class DraftEditorHooks(
  draftItemService: ItemDraftService,
  itemService: ItemService,
  assets: Assets with ItemDraftAssets,
  val containerContext: ContainerExecutionContext) extends ContainerDraftEditorHooks {

  lazy val logger = Logger(this.getClass)

  import play.api.http.Status._

  override def load(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), ItemAndDefaults]] = Future {

    draftItemService.load(id).map { json =>
      logger.trace(s"function=load, id=$id, json=${Json.prettyPrint(json)}")
      Right((json \ "item"), DefaultPlayerSkin.defaultPlayerSkin)
    }.getOrElse {
      val draftId: ContainerDraftId = DraftId.fromString[ObjectId, ContainerDraftId](id, (itemId, name) => ContainerDraftId(new ObjectId(itemId), name))
      val item = itemService.load(draftId.itemId.toString).get
      draftItemService.createDraft(draftId.itemId, Some(draftId.name), item)
      assets.copyItemToDraft(draftId.itemId.toString, draftId.name)
      logger.trace(s"function=load, id=$id, json=${Json.prettyPrint(item)} - created item")
      Right((item, DefaultPlayerSkin.defaultPlayerSkin))
    }
  }

  override def deleteFile(id: String, path: String)(implicit header: RequestHeader): Future[Option[(Int, String)]] = assets.delete(AssetType.Draft, id, path)(header)

  override def upload(draftId: String, file: String)(predicate: (RequestHeader) => Option[SimpleResult]): BodyParser[Future[UploadResult]] = {

    def shellPredicate(rh: RequestHeader): Option[SimpleResult] = {
      predicate(rh).orElse {
        if (rh.getQueryString("fail").exists(_ == "true")) {
          Some(Results.BadRequest("Fail is in the queryString"))
        } else {
          None
        }
      }
    }
    assets.upload(AssetType.Draft, draftId, file)(shellPredicate)
  }
  override def loadFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult = assets.load(AssetType.Draft, id, path)(request)

}

