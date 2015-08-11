package org.corespring.shell.controllers.editor

import com.mongodb.casbah.Imports._
import com.mongodb.casbah.commons.MongoDBObject
import org.bson.types.ObjectId
import org.corespring.container.client.hooks._
import org.corespring.container.client.hooks.Hooks.{ R, StatusMessage }
import org.corespring.container.client.{ hooks => containerHooks }
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.controllers.editor.actions.{ DraftId, ContainerDraftId }
import org.corespring.shell.services.ItemDraftService
import org.joda.time.DateTime
import play.api.Logger
import play.api.http.Status._
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.Future
import scalaz.{ Failure, Success }

trait ItemDraftSupportingMaterialHooks
  extends containerHooks.SupportingMaterialHooks
  with SupportingMaterialHooksHelper {

  import scala.concurrent.ExecutionContext.Implicits.global

  def assets: SupportingMaterialAssets[DraftId[ObjectId]]

  def draftItemService: ItemDraftService

  override def create[F <: File](id: String, sm: CreateNewMaterialRequest[F])(implicit h: RequestHeader): R[JsValue] = withDraftId(id) { (draftId) =>
    Future {

      def upload(binary: Binary) = assets.uploadSupportingMaterialBinary(draftId, binary).bimap(
        (e: String) => (INTERNAL_SERVER_ERROR -> e),
        (s: String) => sm)

      val query = MongoDBObject("_id" -> DraftId.dbo(draftId))
      updateDBAndUploadBinary(draftItemService.collection, query, sm, upload).toEither
    }
  }

  override def deleteAsset(id: String, name: String, filename: String)(implicit h: RequestHeader): R[JsValue] = withDraftId(id) { (draftId) =>
    Future {

      val query = MongoDBObject("_id" -> DraftId.dbo(draftId), "item.supportingMaterials.name" -> name)

      val update = MongoDBObject(
        "$pull" -> MongoDBObject(
          "item.supportingMaterials.$.files" -> MongoDBObject(
            "name" -> filename))) ++ dm

      val wr = draftItemService.collection.update(query, update, false, false)

      if (wr.getN == 1) {
        assets.deleteAssetFromSupportingMaterial(draftId, name, filename)
        Right(Json.obj())
      } else {
        Left((BAD_REQUEST, "Failed to remove the asset"))
      }
    }
  }

  private def dm = MongoDBObject("$set" -> MongoDBObject("item.dateModified" -> DateTime.now))

  override def addAsset(id: String, name: String, binary: Binary)(implicit h: RequestHeader): R[JsValue] = withDraftId(id) { (draftId) =>
    Future {
      ContainerDraftId.fromString(id).map { draftId =>
        val query = MongoDBObject("_id" -> DraftId.dbo(draftId), "item.supportingMaterials.name" -> name)
        val update = MongoDBObject(
          "$push" -> MongoDBObject("item.supportingMaterials.$.files" -> binaryToDbo(binary))) ++ dm

        val wr = draftItemService.collection.update(query, update, false, false)

        if (wr.getN == 1) {
          assets.uploadAssetToSupportingMaterial(draftId, name, binary)
          Right(Json.obj())
        } else {
          Left((BAD_REQUEST, "Failed to remove the asset"))
        }
      }.getOrElse(Left(BAD_REQUEST -> "Can't parse draft id"))
    }
  }

  private def withDraftId(id: String)(fn: DraftId[ObjectId] => R[JsValue]): R[JsValue] = {
    ContainerDraftId.fromString(id).map { draftId =>
      fn(draftId)
    }.getOrElse(Future(Left(BAD_REQUEST -> "Can't parse draft id")))
  }

  override def delete(id: String, name: String)(implicit h: RequestHeader): R[JsValue] = withDraftId(id) { (draftId: DraftId[ObjectId]) =>
    Future {
      val query = MongoDBObject("_id" -> DraftId.dbo(draftId))
      val update = MongoDBObject(
        "$pull" -> MongoDBObject("item.supportingMaterials" -> MongoDBObject("name" -> name))) ++ dm
      val wr = draftItemService.collection.update(query, update)

      if (wr.getN == 1) {
        //in the main app we'd remove any assets too
        Right(Json.obj())
      } else {
        Left((BAD_REQUEST, "Failed to remove the asset"))
      }
    }
  }

  override def getAsset(id: String, name: String, filename: String)(implicit h: RequestHeader): SimpleResult = ???
}

trait ItemDraftHooks
  extends containerHooks.CoreItemHooks
  with containerHooks.DraftHooks
  with ItemHooksHelper {

  val logger = Logger(classOf[ItemDraftHooks])

  def assets: ItemDraftAssets

  import com.mongodb.casbah.commons.conversions.scala._
  RegisterJodaTimeConversionHelpers()

  def draftItemService: ItemDraftService

  def itemService: MongoService

  lazy val draftFineGrainedSave = fineGrainedSave(draftItemService, processResultJson) _

  override def save(draftId: String, json: JsValue)(implicit request: RequestHeader): Future[Either[(Int, String), JsValue]] = Future {
    logger.trace(s"save json=$json")

    val toSave = json.as[JsObject] ++ Json.obj("dateModified" -> Json.obj("$date" -> DateTime.now))

    draftItemService.save(draftId, Json.obj("item" -> toSave)) match {
      case None => Left(BAD_REQUEST -> "Error Saving")
      case Some(json) => Right(json)
    }
  }

  override def saveCollectionId(draftId: String, collectionId: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    draftFineGrainedSave(draftId, Json.obj("item.collection" -> Json.obj("id" -> collectionId)))

  override def saveComponents(draftId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    draftFineGrainedSave(draftId, Json.obj("item.components" -> json))

  override def saveCustomScoring(draftId: String, customScoring: String)(implicit header: RequestHeader): R[JsValue] = {
    draftFineGrainedSave(draftId, Json.obj("item.customScoring" -> customScoring))
  }

  override def saveProfile(draftId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    draftFineGrainedSave(draftId, Json.obj("item.profile" -> json))

  override def saveSummaryFeedback(draftId: String, fb: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    draftFineGrainedSave(draftId, Json.obj("item.summaryFeedback" -> fb))

  override def saveSupportingMaterials(draftId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = {
    draftFineGrainedSave(draftId, Json.obj("item.supportingMaterials" -> addSupportingMaterialIds(json)))
  }

  override def saveXhtml(draftId: String, xhtml: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    draftFineGrainedSave(draftId, Json.obj("item.xhtml" -> xhtml))

  def processResultJson(result: JsObject): JsObject = {
    val withoutItemPrefix = result.fields.map { f =>
      (f._1.replace("item.", "") -> f._2)
    }.head
    val out = Json.obj(withoutItemPrefix._1 -> withoutItemPrefix._2)
    out
  }

  override def load(draftId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = {
    Future {
      draftItemService.load(draftId).map { json =>
        Right(json \ "item")
      }.getOrElse(Left(NOT_FOUND -> s"draftId: $draftId"))
    }
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
      itemId <- Some(draftId.itemId)
      _ <- Some(logger.debug(s"itemId=$itemId"))
      item <- itemService.collection.findOneByID(itemId, MongoDBObject("dateModified" -> 1))
      _ <- Some(logger.debug(s"item=$item"))
      itemDateModified <- Some(item.get("dateModified").asInstanceOf[DateTime])
      _ <- Some(logger.debug(s"itemDateModified=$itemDateModified"))
    } yield {
      logger.trace(s"draft date modified: $draftDateModified")
      logger.trace(s"item date modified: $itemDateModified")
      if (itemDateModified == null || draftDateModified == null) {
        true
      } else {
        val isEqual = draftDateModified.isEqual(itemDateModified.getMillis)
        val draftIsBefore = draftDateModified.isBefore(itemDateModified.getMillis)
        logger.trace(s"isEqual: $isEqual, is draft before: $draftIsBefore")
        isEqual || !draftIsBefore
      }
    }
  }.getOrElse(true)

  override def commit(draftId: String, force: Boolean)(implicit h: RequestHeader): R[JsValue] = Future {
    logger.debug(s"commit draftId=$draftId, force=$force")
    draftItemService.load(draftId).map { draft =>
      val item = (draft \ "item").as[JsObject]
      logger.trace(s"commit item: ${item}")
      val itemId = (draft \ "_id" \ "itemId" \ "$oid").as[String] //draftId.itemId

      if (okToCommit(draftId) || force) {
        val updatedItem = item ++ Json.obj("dateModified" -> Json.obj("$date" -> new DateTime().getMillis()))
        itemService.save(itemId.toString, updatedItem)
        assets.copyDraftToItem(draftId.toString, itemId.toString)
        delete(draftId)
        Right(Json.obj("itemId" -> itemId.toString, "draftId" -> draftId))
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

