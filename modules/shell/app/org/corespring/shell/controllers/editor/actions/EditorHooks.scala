package org.corespring.shell.controllers.editor.actions

import com.mongodb.casbah.commons.MongoDBObject
import org.bson.types.ObjectId
import org.corespring.container.client.controllers.{ AssetType, Assets }
import org.corespring.container.client.hooks.{ EditorHooks => ContainerEditorHooks, UploadResult }
import org.corespring.container.logging.ContainerLogger
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.services.ItemDraftService
import play.api.libs.json.{ Json, JsValue }
import play.api.mvc._

import scala.concurrent.Future

abstract class DraftId[A](val itemId: A, val name: String)

case class ContainerDraftId(override val itemId: ObjectId, override val name: String)
  extends DraftId[ObjectId](itemId, name)

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

trait EditorHooks extends ContainerEditorHooks {

  lazy val logger = ContainerLogger.getLogger("EditorHooks")

  def draftItemService: ItemDraftService

  def itemService: MongoService

  def assets: Assets

  import play.api.http.Status._

  override def load(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future {
    draftItemService.load(id).map { json =>
      Right(json)
    }.getOrElse {
      val draftId: ContainerDraftId = DraftId.fromString[ObjectId, ContainerDraftId](id, (itemId, name) => ContainerDraftId(new ObjectId(itemId), name))
      val item = itemService.load(draftId.itemId.toString).get
      draftItemService.createDraft(draftId.itemId, Some(draftId.name), item)
      Right(Json.obj("item" -> item))
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

