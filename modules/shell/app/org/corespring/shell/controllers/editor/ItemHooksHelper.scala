package org.corespring.shell.controllers.editor

import com.mongodb.DBObject
import com.mongodb.casbah.MongoCollection
import com.mongodb.casbah.commons.{MongoDBList, MongoDBObject}
import org.bson.types.ObjectId
import org.corespring.container.client.hooks._
import org.corespring.mongo.json.services.MongoService
import play.api.http.Status._
import play.api.libs.json.{ Json, JsObject, JsArray, JsValue }

import scala.concurrent.Future
import scalaz.{Failure, Success, Validation}

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

  protected def updateDBAndUploadBinary[F <: File](
                                          collection:MongoCollection,
                                          query:DBObject,
                                          sm:SupportingMaterial[F],
                                          upload: Binary => Validation[(Int,String),Seq[SupportingMaterial[File]]]) : Validation[(Int,String), Seq[SupportingMaterial[File]]]= {

      val dbo = sm match {
        case HtmlSupportingMaterial(name, materialType, markup, _) => {
          MongoDBObject(
            "name" -> name,
            "materialType" -> materialType,
            "files" ->  MongoDBList(
              MongoDBObject(
                "_t" -> "org.corespring.platform.core.models.item.resource.VirtualFile",
                "name" -> "index.html",
                "isMain" -> true,
                "contentType" -> "text/html"
              )
            )
          )
        }
        case BinarySupportingMaterial(name, materialType, binary) => {

          MongoDBObject(
            "name" -> name,
            "materialType" -> materialType,
            "files" -> MongoDBList(
              "_t" -> "org.corespring.platform.core.models.item.resource.StoredFile",
              "name" -> binary.name,
              "isMain" -> true,
              "contentType" -> binary.mimeType
            )
          )
        }
      }
      val update = MongoDBObject("$push" -> MongoDBObject("supportingMaterials" -> dbo ))
      val wr = collection.update(query, update, false, false)

      if(wr.getN == 1){

        sm match {
          case BinarySupportingMaterial(_,_,binary) => upload(binary)
          case _ => Success(Seq.empty)
        }
      } else {
        Failure((500, "Update failed"))
      }
  }

}
