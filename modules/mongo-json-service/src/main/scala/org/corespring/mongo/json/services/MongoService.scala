package org.corespring.mongo.json.services

import com.mongodb.casbah.Imports._
import com.mongodb.{ MongoException, DBObject }
import com.mongodb.casbah.{ WriteConcern, MongoCollection }
import com.mongodb.casbah.commons.MongoDBObject
import com.mongodb.util.{ JSON => MongoJson }
import org.bson.types.ObjectId
import org.joda.time.DateTime
import play.api.http.Status._
import play.api.libs.json.{Json => PlayJson, _}
import org.corespring.container.logging.ContainerLogger

import scala.util.Random

object MongoServiceException {

  def mkMessage(action: String, collection: String, msg: Option[String] = None): String = {
    s"Error with $action on collection $collection ${msg.map(m => s"- $m").getOrElse("")}"
  }

  def apply(action: String, collection: String, message: String): MongoServiceException = new MongoServiceException(mkMessage(action, collection, Some(message)))
  def apply(action: String, collection: String, cause: Throwable) = new MongoServiceException(mkMessage(action, collection, None)).initCause(cause)
}

case class MongoServiceException(msg: String) extends RuntimeException(msg)

class MongoService(val collection: MongoCollection) {

  def logger = ContainerLogger.getLogger(s"MongoService.${collection.name}")

  def list(fields: String*): Seq[JsValue] = {

    logger.debug(s"list: ${fields.mkString(",")}")

    val fieldsDbo = MongoDBObject(fields.toList.map(s => (s, 1)))
    collection.find(MongoDBObject(), fieldsDbo).toSeq.map {
      dbo =>
        val jsonString = MongoJson.serialize(dbo)
        logger.trace(s"found: $jsonString")
        PlayJson.parse(jsonString)
    }
  }

  def load(id: String): Option[JsValue] = withQuery(id) {
    q =>
      logger.debug(s"[load]: $id")
      val maybeDbo: Option[DBObject] = collection.findOne(q)
      maybeDbo.map {
        dbo =>
          val s = MongoJson.serialize(dbo)
          val json = PlayJson.parse(s)
          logger.trace(s"[load]: $id : ${PlayJson.stringify(json)}")
          json.as[JsObject]
      }
  }

  def create(data: JsValue, id: Option[ObjectId] = None): Option[ObjectId] = {

    logger.debug("[create]")
    val oid = id.getOrElse(ObjectId.get())
    val jsonString = PlayJson.stringify(data)
    logger.trace(s"[create]: $jsonString")
    val dbo = MongoJson.parse(jsonString).asInstanceOf[DBObject]
    dbo.put("_id", oid)

    try {
      val result = collection.insert(dbo, WriteConcern.Safe)
      if (result.getLastError.ok) {
        Some(oid)
      } else {
        throw MongoServiceException("insert", collection.name, result.getLastError.getErrorMessage)
      }
    } catch {
      case mse: MongoServiceException => throw mse
      case e: MongoException => {
        throw MongoServiceException("insert", collection.name, e)
      }
      case t: Throwable => {
        throw MongoServiceException("insert", collection.name, t)
      }
    }
  }

  def delete(id: String): Unit = withQuery(id) { q =>
    collection.findAndRemove(q).map(toJson)
  }

  def fineGrainedSave(id: String, data: JsValue): Option[JsObject] = withQuery(id) {
    q =>
      logger.debug(s"[save]: $id")
      logger.trace(s"[save]: ${PlayJson.stringify(data)}")

      val setDbo = toDbo(data)
      setDbo.removeField("_id")
      logger.trace(s"set dbo: $setDbo")
      val d = MongoDBObject("$set" -> setDbo)
      val result = collection.update(q, d, false, false, WriteConcern.Safe)

      if (result.getLastError(WriteConcern.Safe).ok()) {
        Some(data.as[JsObject])
      } else {
        logger.warn(s"Error saving: $id")
        None
      }
  }

  def toDbo(json: JsValue): DBObject = MongoJson.parse(PlayJson.stringify(json)).asInstanceOf[DBObject]
  def toJson(dbo: DBObject) = PlayJson.parse(MongoJson.serialize(dbo)).as[JsObject]

  def save(id: String, data: JsValue): Option[JsValue] = withQuery(id) {
    q =>
      logger.debug(s"[save]: $id")
      logger.trace(s"[save]: ${PlayJson.stringify(data)}")

      val setDbo = toDbo(data)
      setDbo.removeField("_id")
      logger.trace(s"set dbo: $setDbo")
      val d = MongoDBObject("$set" -> setDbo)
      val result = collection.update(q, d, true, false, WriteConcern.Safe)

      if (result.getLastError(WriteConcern.Safe).ok()) {
        Some(data.as[JsObject])
      } else {
        logger.warn(s"Error saving: $id")
        None
      }
  }

  protected def withQuery(id: String)(block: DBObject => Option[JsObject]): Option[JsObject] = {
    if (ObjectId.isValid(id)) {
      val oid = new ObjectId(id)
      block(MongoDBObject("_id" -> oid))
    } else None
  }

}

