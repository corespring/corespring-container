package org.corespring.shell.services

import com.mongodb.DBObject
import com.mongodb.casbah.MongoCollection
import com.mongodb.casbah.commons.MongoDBObject
import org.bson.types.ObjectId
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.controllers.editor.actions.{ ContainerDraftId, DraftId }
import play.api.libs.json.{ JsObject, Json, JsValue }
import play.api.mvc.RequestHeader

import scala.concurrent.Future
import scala.util.Random

class ItemDraftService(override val collection: MongoCollection) extends MongoService(collection) {

  private def randomKey(length: Int = 8): String = {
    val chars = ('a' to 'z') ++ ('A' to 'Z') ++ ('0' to '9')
    (1 to length).map { x =>
      val index = Random.nextInt(chars.length)
      chars(index)
    }.mkString("")
  }

  protected def findDraft(id: DraftId[ObjectId]): Option[JsValue] = {
    collection.findOne(MongoDBObject("_id" -> MongoDBObject("itemId" -> id.itemId, "name" -> id.name))).map { toJson }
  }

  def createDraft(itemId: ObjectId, name: Option[String] = None, item: JsValue) =
    for {
      draftName <- name.orElse(Some(randomKey()))
      dbo <- Some(MongoDBObject("_id" -> MongoDBObject("itemId" -> itemId, "name" -> draftName), "item" -> toDbo(item)))
      result <- Some(collection.save(dbo))
      if (result.getLastError().ok)
    } yield (itemId.toString, draftName)

  override def create(data: JsValue) = throw new RuntimeException("ItemDraftService doesn't support create, use createDraft")

  override def load(id: String) = {
    val draftId: ContainerDraftId = DraftId.fromString[ObjectId, ContainerDraftId](id, (itemId, name) => ContainerDraftId(new ObjectId(itemId), name))
    findDraft(draftId)
  }

  override protected def withQuery(id: String)(block: DBObject => Option[JsObject]): Option[JsObject] = {
    val draftId: ContainerDraftId = DraftId.fromString[ObjectId, ContainerDraftId](id, (itemId, name) => ContainerDraftId(new ObjectId(itemId), name))
    block(MongoDBObject("_id" -> DraftId.dbo(draftId)))
  }

}
