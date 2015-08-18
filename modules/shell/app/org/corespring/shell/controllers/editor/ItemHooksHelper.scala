package org.corespring.shell.controllers.editor

import com.mongodb.casbah.Imports._
import org.bson.types.ObjectId
import org.corespring.container.client.hooks._
import org.corespring.mongo.json.services.MongoService
import play.api.http.Status._
import play.api.libs.json.{ Json, JsObject, JsArray, JsValue }

import scala.concurrent.Future
import scala.util.Try
import scalaz.{ Failure, Success, Validation }
import scala.concurrent.ExecutionContext.Implicits.global

trait SupportingMaterialHooksHelper {

  def prefix(s: String): String = s

  protected def binaryToDbo(binary: Binary, isMain: Boolean): DBObject = {
    MongoDBObject(
      "_t" -> "org.corespring.platform.core.models.item.resource.StoredFile",
      "name" -> binary.name,
      "isMain" -> isMain,
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
        "files" -> MongoDBList(binaryToDbo(binary, true)))
    }
  }

  protected def updateDBAndUploadBinary[F <: File](collection: MongoCollection,
    query: DBObject,
    sm: CreateNewMaterialRequest[F],
    upload: Binary => Validation[(Int, String), CreateNewMaterialRequest[F]]): Validation[(Int, String), JsValue] = {
    val dbo = materialToDbo(sm)
    lazy val json = Json.parse(com.mongodb.util.JSON.serialize(dbo))
    val update = MongoDBObject("$push" -> MongoDBObject(prefix("supportingMaterials") -> dbo))
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

  private def getDbo(dbo: DBObject, keys: List[String]): DBObject = {
    keys match {
      case Nil => dbo
      case head :: xs => {
        val inner = dbo.get(head).asInstanceOf[DBObject]
        getDbo(inner, xs)
      }
    }
  }

  protected def mkUpdateContentFunction(mkBaseQuery: String => DBObject, collection: MongoCollection)(id: String, name: String, filename: String, content: String): Future[Either[(Int, String), JsValue]] = Future {

    def getFiles(dbo: DBObject): Option[BasicDBList] = Try {
      val materials = getDbo(dbo, prefix("supportingMaterials").split("\\.").toList).asInstanceOf[BasicDBList]
      val m = materials.get(0).asInstanceOf[BasicDBObject]
      m.get("files").asInstanceOf[BasicDBList]
    }.toOption

    def updateFile(filename: String, content: String)(f: Any) = {
      val dbo = f.asInstanceOf[BasicDBObject]
      if (dbo.getString("name") == filename) {
        dbo.put("content", content)
      }
      dbo
    }

    val query = new MongoDBObject(mkBaseQuery(id)) ++ MongoDBObject(
      prefix("supportingMaterials.name") -> name,
      prefix("supportingMaterials.files.name") -> filename)

    val fields = MongoDBObject(prefix("supportingMaterials.$.files") -> 1)
    val rawDbo = collection.findOne(query, fields)
    val result = for {
      dbo <- rawDbo
      files <- getFiles(dbo)
    } yield {
      val updatedFiles = files.map(updateFile(filename, content))
      val filesUpdate = MongoDBObject("$set" -> MongoDBObject(prefix("supportingMaterials.$.files") -> updatedFiles))
      collection.update(query, filesUpdate)
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
