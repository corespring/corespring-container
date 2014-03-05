package org.corespring.mongo.json.services

import com.mongodb.DBObject
import com.mongodb.casbah.{ WriteConcern, MongoCollection }
import com.mongodb.casbah.commons.MongoDBObject
import com.mongodb.util.{JSON => MongoPlayJson}
import org.bson.types.ObjectId
import play.api.Logger
import play.api.libs.json.{ JsObject, Json => PlayJson, JsValue }

class MongoService(collection: MongoCollection) {

  def logger = Logger(s"shell.mongo-service.${collection.name}")

  def list(fields: String*): Seq[JsValue] = {

    logger.debug(s"list: ${fields.mkString(",")}")

    val fieldsDbo = MongoDBObject(fields.toList.map(s => (s, 1)))
    collection.find(MongoDBObject(), fieldsDbo).toSeq.map {
      dbo =>
        val jsonString = MongoPlayJson.serialize(dbo)
        logger.trace(s"found: $jsonString")
        PlayJson.parse(jsonString)
    }
  }

  def load(id: String): Option[JsValue] = withOid(id) {
    oid =>
      logger.debug(s"[load]: $id")
      val maybeDbo: Option[DBObject] = collection.findOneByID(oid)
      maybeDbo.map {
        dbo =>
          val s = MongoPlayJson.serialize(dbo)
          val json = PlayJson.parse(s)
          logger.trace(s"[load]: $id : ${PlayJson.stringify(json)}")
          json
      }
  }

  def create(data: JsValue): Option[ObjectId] = {

    logger.debug("[create]")
    val oid = ObjectId.get
    val jsonString = PlayJson.stringify(data)
    logger.trace(s"[create]: $jsonString")
    val dbo = MongoPlayJson.parse(jsonString).asInstanceOf[DBObject]
    dbo.put("_id", oid)

    val result = collection.insert(dbo)
    if (result.getLastError.ok) {
      Some(oid)
    } else {
      None
    }
  }

  def save(id: String,  data: JsValue, property : Option[String]): Option[JsValue] = withOid(id) {
    oid =>
      logger.debug(s"[save]: $id")
      logger.trace(s"[save]: ${PlayJson.stringify(data)}")

      val idObject = PlayJson.obj("_id" ->
        PlayJson.obj("$oid" -> id))


      def toDbo(json:JsValue) : DBObject = MongoPlayJson.parse(PlayJson.stringify(json)).asInstanceOf[DBObject]

      val updateObject = data.as[JsObject] ++ idObject

      def saveEverything = {
        collection.save( toDbo(updateObject), WriteConcern.Safe)
      }

      val result = property.map{ p =>
        val q = MongoDBObject("_id" -> new ObjectId(id))
        val d = MongoDBObject("$set" -> MongoDBObject(p -> toDbo(data)))
        collection.update(q, d, false, false, WriteConcern.Safe)
      }.getOrElse(saveEverything)

      if (result.getLastError(WriteConcern.Safe).ok()) {
        Some(data)
      } else {
        logger.warn(s"Error saving: $id")
        None
      }
  }

  private def withOid(id: String)(block: ObjectId => Option[JsValue]): Option[JsValue] = if (ObjectId.isValid(id)) {
    val oid = new ObjectId(id)
    block(oid)
  } else None

}

