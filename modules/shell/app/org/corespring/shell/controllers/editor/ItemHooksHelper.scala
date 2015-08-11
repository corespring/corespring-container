package org.corespring.shell.controllers.editor

import com.mongodb.DBObject
import com.mongodb.casbah.MongoCollection
import com.mongodb.casbah.commons.{ MongoDBList, MongoDBObject }
import org.bson.types.ObjectId
import org.corespring.container.client.hooks._
import org.corespring.mongo.json.services.MongoService
import play.api.http.Status._
import play.api.libs.json.{ Json, JsObject, JsArray, JsValue }

import scala.concurrent.Future
import scalaz.{ Failure, Success, Validation }

trait SupportingMaterialHooksHelper {

  protected def binaryToDbo(binary: Binary): DBObject = {
    MongoDBObject(
      "_t" -> "org.corespring.platform.core.models.item.resource.StoredFile",
      "name" -> binary.name,
      "isMain" -> true,
      "contentType" -> binary.mimeType)
  }

  private def materialToDbo[F <: File](sm: CreateNewMaterialRequest[F]): DBObject = sm match {
    case CreateHtmlMaterial(name, materialType, html, _) => {
      MongoDBObject(
        "name" -> name,
        "materialType" -> materialType,
        "files" -> MongoDBList(
          MongoDBObject(
            "_t" -> "org.corespring.platform.core.models.item.resource.VirtualFile",
            "name" -> "index.html",
            "isMain" -> true,
            "content" -> html.content,
            "contentType" -> "text/html")))
    }
    case CreateBinaryMaterial(name, materialType, binary) => {
      MongoDBObject(
        "name" -> name,
        "materialType" -> materialType,
        "files" -> MongoDBList(binaryToDbo(binary)))
    }
  }

  protected def updateDBAndUploadBinary[F <: File](
    collection: MongoCollection,
    query: DBObject,
    sm: CreateNewMaterialRequest[F],
    upload: Binary => Validation[(Int, String), CreateNewMaterialRequest[F]]): Validation[(Int, String), JsValue] = {
    val dbo = materialToDbo(sm)
    lazy val json = Json.parse(com.mongodb.util.JSON.serialize(dbo))
    val update = MongoDBObject("$push" -> MongoDBObject("supportingMaterials" -> dbo))
    val wr = collection.update(query, update, false, false)

    if (wr.getN == 1) {
      sm match {
        case CreateBinaryMaterial(_, _, binary) => upload(binary).map { sm => json }
        case _ => Success(json)
      }
    } else {
      Failure((500, "Update failed"))
    }
  }

}
trait ItemHooksHelper {

  import scala.concurrent.ExecutionContext.Implicits.global

  def addSupportingMaterialIds(sm: JsValue): JsArray = sm match {
    case JsArray(o) => JsArray(o.map({
      case obj: JsObject => obj ++ Json.obj("id" -> ObjectId.get.toString)
      case other: JsValue => other
    }))
    case _ => JsArray(Seq.empty)
  }

  def passThrough(json: JsObject) = json

  def fineGrainedSave(service: MongoService, resultProcessor: JsObject => JsObject = passThrough)(id: String, json: JsValue): Future[Either[(Int, String), JsValue]] = Future {
    service.fineGrainedSave(id, json).map {
      result =>
        val out = resultProcessor(result)
        Right(out)
    }.getOrElse(Left(BAD_REQUEST -> "Error saving"))
  }

}
