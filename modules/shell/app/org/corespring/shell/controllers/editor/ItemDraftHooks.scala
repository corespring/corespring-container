package org.corespring.shell.controllers.editor

import com.mongodb.casbah.Imports._
import org.bson.types.ObjectId
import org.corespring.container.client.hooks.Hooks.{ R, StatusMessage }
import org.corespring.container.client.hooks.{ ItemDraftHooks => ContainerItemDraftHooks, ItemHooks => ContainerItemHooks }
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.controllers.editor.actions.{ DraftId, ContainerDraftId }
import org.corespring.shell.services.ItemDraftService
import org.joda.time.DateTime
import play.api.Logger
import play.api.http.Status._
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.Future

trait ItemHooks extends ContainerItemHooks {
  def itemService: MongoService

  override def load(itemId: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future {
    itemService.load(itemId).map { i =>
      Right(i)
    }.getOrElse(Left((NOT_FOUND, s"Can't find item with id: $itemId")))
  }

  override def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[StatusMessage, String]] = Future {
    val newItem = Json.obj(
      "components" -> Json.obj(),
      "profile" -> Json.obj("taskInfo" -> Json.obj("title" -> "Untitled")),
      "metadata" -> Json.obj(),
      "xhtml" -> "<div></div>")

    itemService.create(newItem).map {
      oid =>
        Right(oid.toString)
    }.getOrElse(Left(BAD_REQUEST -> "Error creating item"))
  }

}

trait ItemDraftAssets {
  def copyItemToDraft(itemId: String, draftName: String)
  def copyDraftToItem(draftId: String, itemId: String)
  def deleteDraft(draftId: String)
}

trait ItemDraftHooks extends ContainerItemDraftHooks {

  val logger = Logger(classOf[ItemDraftHooks])

  def assets: ItemDraftAssets

  import com.mongodb.casbah.commons.conversions.scala._
  RegisterJodaTimeConversionHelpers()

  def draftItemService: ItemDraftService

  def itemService: MongoService

  override def saveProfile(draftId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    fineGrainedSave(draftId, Json.obj("item.profile" -> json))

  override def saveXhtml(draftId: String, xhtml: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    fineGrainedSave(draftId, Json.obj("item.xhtml" -> xhtml))

  override def saveSummaryFeedback(draftId: String, fb: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    fineGrainedSave(draftId, Json.obj("item.summaryFeedback" -> fb))

  override def saveSupportingMaterials(draftId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = {
    def addSupportingMaterialIds(sm: JsValue): JsArray = sm match {
      case JsArray(o) => JsArray(o.map({
        case obj: JsObject => obj ++ Json.obj("id" -> ObjectId.get.toString)
        case other: JsValue => other
      }))
      case _ => JsArray(Seq.empty)
    }
    fineGrainedSave(draftId, Json.obj("item.supportingMaterials" -> addSupportingMaterialIds(json)))
  }

  override def saveComponents(draftId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    fineGrainedSave(draftId, Json.obj("item.components" -> json))

  override def saveCustomScoring(draftId: String, customScoring: String)(implicit header: RequestHeader): R[JsValue] = {
    fineGrainedSave(draftId, Json.obj("item.customScoring" -> customScoring))
  }

  private def fineGrainedSave(draftId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = {
    Future {
      draftItemService.fineGrainedSave(draftId, json).map {
        result =>
          val trimmed = result.fields.map { f =>
            (f._1.replace("item.", "") -> f._2)
          }.head
          val out = Json.obj(trimmed._1 -> trimmed._2)
          Right(out)
      }.getOrElse(Left(BAD_REQUEST -> "Error saving"))
    }
  }

  override def load(draftId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = {
    Future {
      draftItemService.load(draftId).map {
        Right(_)
      }.getOrElse(Left(NOT_FOUND -> s"draftId: $draftId"))
    }
  }

  private def addDateModified(itemId: String) = {
    val builder = DBObject.newBuilder
    builder += "_id" -> new ObjectId(itemId)
    builder += "dateModified" -> MongoDBObject("$exists" -> false)
    itemService.collection.update(builder.result, $set("dateModified" -> DateTime.now), false, false)
  }

  override def delete(draftId: String)(implicit h: RequestHeader): R[JsValue] = Future {
    draftItemService.delete(draftId)
    assets.deleteDraft(draftId)
    Right(Json.obj("id" -> draftId))
  }

  private def okToCommit(draftIdRaw: String): Boolean = {

    val draftId: ContainerDraftId = DraftId.fromString[ObjectId, ContainerDraftId](draftIdRaw, (itemId, name) => ContainerDraftId(new ObjectId(itemId), name))
    logger.trace(s"okToCommit draftId=$draftId")
    val query = DraftId.dbo[ObjectId](draftId)
    logger.trace(s"okToCommit query=$query")
    val count = draftItemService.collection.count(MongoDBObject("_id" -> query))
    logger.trace(s"okToCommit count=$count")

    for {
      draft <- draftItemService.collection.findOneByID(query, MongoDBObject("item.dateModified" -> 1, "item._id" -> 1))
      _ <- Some(logger.debug(s"draft=$draft"))
      draftItem <- Some(draft.get("item").asInstanceOf[DBObject])
      _ <- Some(logger.debug(s"draftItem=$draftItem"))
      draftDateModified <- Some(draftItem.get("dateModified").asInstanceOf[DateTime])
      _ <- Some(logger.debug(s"draftDateModified=$draftDateModified"))
      itemId <- Some(draftItem.get("_id").asInstanceOf[ObjectId])
      _ <- Some(logger.debug(s"itemId=$itemId"))
      item <- itemService.collection.findOneByID(itemId, MongoDBObject("dateModified" -> 1))
      _ <- Some(logger.debug(s"item=$item"))
      itemDateModified <- Some(item.get("dateModified").asInstanceOf[DateTime])
      _ <- Some(logger.debug(s"itemDateModified=$itemDateModified"))
    } yield {
      logger.trace(s"draft date modified: $draftDateModified")
      logger.trace(s"item date modified: $itemDateModified")
      val isEqual = draftDateModified.isEqual(itemDateModified.getMillis)
      val draftIsBefore = draftDateModified.isBefore(itemDateModified.getMillis)
      logger.trace(s"isEqual: $isEqual, is draft before: $draftIsBefore")
      isEqual || !draftIsBefore
    }
  }.getOrElse(true)

  override def commit(draftId: String, force: Boolean)(implicit h: RequestHeader): R[JsValue] = Future {
    logger.debug(s"commit draftId=$draftId, force=$force")
    draftItemService.load(draftId).map { draft =>
      val item = (draft \ "item").as[JsObject]
      val itemId = (item \ "_id" \ "$oid").as[String]

      if (okToCommit(draftId) || force) {
        val updatedItem = item ++ Json.obj("dateModified" -> Json.obj("$date" -> new DateTime().getMillis()))
        itemService.save(itemId, updatedItem)
        assets.copyDraftToItem(draftId.toString, itemId)
        delete(draftId)
        Right(Json.obj("itemId" -> itemId, "draftId" -> draftId))
      } else {
        Left(CONFLICT, "There has been a new commit since this draft was created")
      }

    }.getOrElse {
      Left((NOT_FOUND, s"Can't find draft by id: $draftId"))
    }
  }

  override def createItemAndDraft()(implicit h: RequestHeader): R[(String, String)] = Future {
    val out = for {
      item <- Some(Json.obj("dateModified" -> DateTime.now, "xhtml" -> "", "components" -> Json.obj()))
      itemId <- itemService.create(item)
      tuple <- draftItemService.createDraft(itemId, None, item)
      draftName <- Some(tuple._2)
      _ <- Some(assets.copyItemToDraft(itemId.toString, draftName))
    } yield (itemId.toString, draftName)

    out match {
      case None => Left(BAD_REQUEST, "Error creating item and draft")
      case Some(tuple) => Right(tuple)
    }
  }

}

