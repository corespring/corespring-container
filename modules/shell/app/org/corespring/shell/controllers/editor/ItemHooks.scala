package org.corespring.shell.controllers.editor

import com.mongodb.casbah.Imports._
import org.bson.types.ObjectId
import org.corespring.container.client.hooks.{ Binary, CreateNewMaterialRequest, File }
import org.corespring.container.client.hooks.Hooks.R
import org.corespring.container.client.{ hooks => containerHooks }
import org.corespring.mongo.json.services.MongoService
import play.api.http.Status._
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.Future
import scala.util.Try

trait ItemSupportingMaterialHooks
  extends containerHooks.SupportingMaterialHooks
  with SupportingMaterialHooksHelper {

  import scala.concurrent.ExecutionContext.Implicits.global

  def assets: SupportingMaterialAssets[String]
  def itemService: MongoService

  override def create[F <: File](id: String, sm: CreateNewMaterialRequest[F])(implicit h: RequestHeader): R[JsValue] = Future {
    {
      val query = MongoDBObject("_id" -> new ObjectId(id))
      def upload(b: Binary) = assets.uploadSupportingMaterialBinary(id, sm.name, b).bimap(
        (e: String) => (INTERNAL_SERVER_ERROR -> e),
        (s: String) => sm)
      updateDBAndUploadBinary(itemService.collection, query, sm, upload)
    }.toEither
  }

  override def deleteAsset(id: String, name: String, filename: String)(implicit h: RequestHeader): R[JsValue] = Future {

    val query = MongoDBObject("_id" -> new ObjectId(id), "supportingMaterials.name" -> name)

    val update = MongoDBObject(
      "$pull" -> MongoDBObject(
        "supportingMaterials.$.files" -> MongoDBObject(
          "name" -> filename)))

    val wr = itemService.collection.update(query, update, false, false)

    if (wr.getN == 1) {
      assets.deleteAssetFromSupportingMaterial(id, name, filename)
      Right(Json.obj())
    } else {
      Left((BAD_REQUEST, "Failed to remove the asset"))
    }
  }

  override def addAsset(id: String, name: String, binary: Binary)(implicit h: RequestHeader): R[JsValue] = Future {
    val query = MongoDBObject("_id" -> new ObjectId(id), "supportingMaterials.name" -> name)
    val binaryDbo = binaryToDbo(binary, false)
    val update = MongoDBObject("$push" -> MongoDBObject("supportingMaterials.$.files" -> binaryDbo))
    val wr = itemService.collection.update(query, update, false, false)

    if (wr.getN == 1) {
      assets.uploadAssetToSupportingMaterial(id, name, binary)
      Right(Json.parse(com.mongodb.util.JSON.serialize(binaryDbo)))
    } else {
      Left((BAD_REQUEST, "Failed to remove the asset"))
    }
  }

  override def delete(id: String, name: String)(implicit h: RequestHeader): R[JsValue] = Future {
    val query = MongoDBObject("_id" -> new ObjectId(id))
    val update = MongoDBObject("$pull" -> MongoDBObject("supportingMaterials" -> MongoDBObject("name" -> name)))
    val wr = itemService.collection.update(query, update)

    if (wr.getN == 1) {
      //in the main app we'd remove any assets too
      Right(Json.obj())
    } else {
      Left((BAD_REQUEST, "Failed to remove the asset"))
    }
  }

  override def getAsset(id: String, name: String, filename: String)(implicit h: RequestHeader): SimpleResult = {
    assets.getAssetFromSupportingMaterial(id, name, filename)
  }

  private def getFiles(dbo: DBObject): Option[BasicDBList] = Try {
    val materials = dbo.get("supportingMaterials").asInstanceOf[BasicDBList]
    val m = materials.get(0).asInstanceOf[BasicDBObject]
    m.get("files").asInstanceOf[BasicDBList]
  }.toOption

  private def updateFile(filename: String, content: String)(f: Any) = {
    val dbo = f.asInstanceOf[BasicDBObject]
    if (dbo.getString("name") == filename) {
      dbo.put("content", content)
    }
    dbo
  }

  override def updateContent(id: String, name: String, filename: String, content: String)(implicit h: RequestHeader): R[JsValue] = Future {
    val query = MongoDBObject(
      "_id" -> new ObjectId(id),
      "supportingMaterials.name" -> name,
      "supportingMaterials.files.name" -> filename)

    val fields = MongoDBObject("supportingMaterials.$.files" -> 1)
    val rawDbo = itemService.collection.findOne(query, fields)
    val result = for {
      dbo <- rawDbo
      files <- getFiles(dbo)
    } yield {
      val updatedFiles = files.map(updateFile(filename, content))
      val filesUpdate = MongoDBObject("$set" -> MongoDBObject("supportingMaterials.$.files" -> updatedFiles))
      itemService.collection.update(query, filesUpdate)
    }

    result.map { wr =>
      if (wr.getN == 1) {
        Right(Json.obj("todo" -> true))
      } else {
        Left(BAD_REQUEST -> "Failed to update")
      }
    }.getOrElse(Left(BAD_REQUEST -> "Can't find field to update"))
  }
}

trait ItemHooks
  extends containerHooks.CoreItemHooks
  with containerHooks.CreateItemHook
  with ItemHooksHelper {
  def itemService: MongoService

  def assets: ItemAssets

  override def load(itemId: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future {
    itemService.load(itemId).map { i =>
      Right(i)
    }.getOrElse(Left((NOT_FOUND, s"Can't find item with id: $itemId")))
  }

  override def delete(id: String)(implicit h: RequestHeader): R[JsValue] = Future {
    itemService.delete(id)
    assets.deleteItem(id)
    Right(Json.obj("id" -> id))
  }

  lazy val itemFineGrainedSave = fineGrainedSave(itemService, passThrough _) _

  override def saveXhtml(id: String, xhtml: String)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("xhtml" -> xhtml))
  }

  override def saveCollectionId(id: String, collectionId: String)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("collection" -> Json.obj("id" -> collectionId)))
  }

  override def saveSupportingMaterials(id: String, json: JsValue)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("supportingMaterials" -> addSupportingMaterialIds(json)))
  }

  override def saveCustomScoring(id: String, customScoring: String)(implicit header: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("customScoring" -> customScoring))
  }

  override def saveComponents(id: String, json: JsValue)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("components" -> json))
  }

  override def saveSummaryFeedback(id: String, feedback: String)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("summaryFeedback" -> feedback))
  }

  override def saveProfile(id: String, json: JsValue)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("profile" -> json))
  }

  override def createItem(json: Option[JsValue])(implicit header: RequestHeader): R[String] = Future {
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
