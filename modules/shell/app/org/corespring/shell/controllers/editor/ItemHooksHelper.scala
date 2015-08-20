package org.corespring.shell.controllers.editor

import org.bson.types.ObjectId
import org.corespring.mongo.json.services.MongoService
import play.api.http.Status._
import play.api.libs.json.{ Json, JsObject, JsArray, JsValue }

import scala.concurrent.Future

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
