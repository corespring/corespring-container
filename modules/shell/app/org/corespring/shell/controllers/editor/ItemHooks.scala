package org.corespring.shell.controllers.editor

import com.mongodb.casbah.Imports._
import org.bson.types.ObjectId
import org.corespring.container.client.hooks.Hooks.{ ItemAndDefaults, R, StatusMessage }
import org.corespring.container.client.hooks._
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.{ hooks => containerHooks }
import org.corespring.shell.DefaultPlayerSkin
import org.corespring.container.client.{hooks => containerHooks}
import org.corespring.container.components.score.ScoringType
import org.corespring.shell.services.ItemService
import play.api.http.Status._
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.Future
import scala.util.Try

class ItemSupportingMaterialHooks(
  assets: SupportingMaterialAssets[String],
  itemService: ItemService,
  val containerContext: ContainerExecutionContext)
  extends containerHooks.ItemSupportingMaterialHooks
  with SupportingMaterialHooksHelper {

  import scala.concurrent.ExecutionContext.Implicits.global

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

  override def addAsset(id: String, name: String, binary: Binary)(implicit h: RequestHeader): R[UploadResult] = Future {
    val query = MongoDBObject("_id" -> new ObjectId(id), "supportingMaterials.name" -> name)
    val binaryDbo = binaryToDbo(binary, false)
    val update = MongoDBObject("$push" -> MongoDBObject("supportingMaterials.$.files" -> binaryDbo))
    val wr = itemService.collection.update(query, update, false, false)

    if (wr.getN == 1) {
      assets.uploadAssetToSupportingMaterial(id, name, binary)
      Right(UploadResult(binary.name))
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
      assets.deleteSupportingMaterialBinary(id, name)
      Right(Json.obj())
    } else {
      Left((BAD_REQUEST, "Failed to remove the asset"))
    }
  }

  override def getAsset(id: String, name: String, filename: String)(implicit h: RequestHeader): Future[Either[StatusMessage, FileDataStream]] = Future {
    assets.getAsset(id, name, filename).leftMap(e => (BAD_REQUEST -> e)).toEither
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

  override def updateContent(id: String, name: String, filename: String, content: String)(implicit h: RequestHeader): R[JsValue] = {
    val fn = mkUpdateContentFunction(
      (id) => MongoDBObject("_id" -> new ObjectId(id)),
      itemService.collection) _
    fn(id, name, filename, content)
  }

}

class ItemHooks(
  itemService: ItemService,
  assets: ItemAssets,
  val containerContext: ContainerExecutionContext)
  extends containerHooks.ItemHooks
  //with CoreItemHooks
  with ItemHooksHelper {

  override def load(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, ItemAndDefaults]] = Future {
    itemService.load(itemId).map { i =>
      Right((i, DefaultPlayerSkin.defaultPlayerSkin))
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

  override def saveConfig(id: String, json: JsValue)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("config" -> json))
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

  override def saveConfigXhtmlAndComponents(id: String, config: JsValue, markup: String, components: JsValue)(implicit h: RequestHeader): R[JsValue] = {
    val configResult = saveConfig(id, config)(h)
    val xhtmlResult = saveXhtml(id, markup)(h)
    val componentResult = saveComponents(id, components)(h)
    for {
      co <- configResult
      x <- xhtmlResult
      c <- componentResult
    } yield {
      (co, x, c) match {
        case (Left((coErr, coMsg)), Left((xErr, xMsg)), Left((cErr, cMsg))) => Left(xErr, xMsg)
        case (Left((err, msg)), _, _) => Left(err, msg)
        case (_, Left((err, msg)), _ ) => Left(err, msg)
        case (_, _, Left((err, msg)) ) => Left(err, msg)
        case (Right(coJson), Right(xJson), Right(cJson)) => Right(xJson.as[JsObject].deepMerge(coJson.as[JsObject]).deepMerge(cJson.as[JsObject]))
      }
    }
  }

  override def saveSummaryFeedback(id: String, feedback: String)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("summaryFeedback" -> feedback))
  }

  override def saveProfile(id: String, json: JsValue)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("profile" -> json))
  }

  override def createItem(collectionId: Option[String])(implicit header: RequestHeader): R[String] = Future {
    val newItem = Json.obj(
      "components" -> Json.obj(),
      "config" -> Json.obj("scoringType" -> ScoringType.WEIGHTED),
      "profile" -> Json.obj("taskInfo" -> Json.obj("title" -> "Untitled")),
      "metadata" -> Json.obj(),
      "xhtml" -> "<div></div>")

    itemService.create(newItem).map {
      oid =>
        Right(oid.toString)
    }.getOrElse(Left(BAD_REQUEST -> "Error creating item"))
  }

  override def createSingleComponentItem(collectionId: Option[String], componentType: String, key: String, defaultData: JsObject)(implicit h: RequestHeader): R[String] = Future {

    val newItem = Json.obj(
      "components" -> Json.obj(key -> Json.obj("componentType" -> componentType).deepMerge(defaultData)),
      "config" -> Json.obj("scoringType" -> ScoringType.WEIGHTED),
      "profile" -> Json.obj("taskInfo" -> Json.obj("title" -> "Untitled")),
      "metadata" -> Json.obj(),
      "xhtml" -> s"<div><div $componentType='' id='$key'></div></div>")

    itemService.create(newItem).map {
      oid =>
        Right(oid.toString)
    }.getOrElse(Left(BAD_REQUEST -> "Error creating item"))
  }
}
