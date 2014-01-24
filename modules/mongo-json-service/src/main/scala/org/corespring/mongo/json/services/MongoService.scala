package org.corespring.mongo.json.services

import com.mongodb.DBObject
import com.mongodb.casbah.{WriteConcern, MongoCollection}
import com.mongodb.casbah.commons.MongoDBObject
import com.mongodb.util.JSON
import org.bson.types.ObjectId
import play.api.Logger
import play.api.libs.json.{JsObject, Json, JsValue}

class MongoService(collection: MongoCollection) {

  def logger = Logger(s"shell.mongo-service.${collection.name}")

  def list(fields: String*): Seq[JsValue] = {

    logger.debug(s"list: ${fields.mkString(",")}")

    val fieldsDbo = MongoDBObject(fields.toList.map(s => (s, 1)))
    collection.find(MongoDBObject(), fieldsDbo).toSeq.map {
      dbo =>
        val jsonString = JSON.serialize(dbo)
        logger.trace(s"found: $jsonString")
        Json.parse(jsonString)
    }
  }

  def load(id: String): Option[JsValue] = withOid(id) {
    oid =>
      logger.debug(s"[load]: $id")
      val maybeDbo: Option[DBObject] = collection.findOneByID(oid)
      maybeDbo.map {
        dbo =>
          val s = JSON.serialize(dbo)
          val json = Json.parse(s)
          logger.trace(s"[load]: $id : ${Json.stringify(json)}")
          json
      }
  }

  def create(data:JsValue) : Option[ObjectId] = {

    logger.debug("[create]")
    val oid = ObjectId.get
    val jsonString = Json.stringify(data)
    logger.trace(s"[create]: $jsonString")
    val dbo = JSON.parse(jsonString).asInstanceOf[DBObject]
    dbo.put("_id", oid)

    val result = collection.insert(dbo)
    if(result.getLastError.ok){
      Some(oid)
    } else {
      None
    }
  }

  def save(id: String, data: JsValue): Option[JsValue] = withOid(id) {
    oid =>
      logger.debug(s"[save]: $id")
      logger.trace(s"[save]: ${Json.stringify(data)}")

      val idObject = Json.obj("_id" ->
        Json.obj("$oid" -> id)
      )

      val updateObject = data.as[JsObject] ++ idObject

      val dbo = JSON.parse(Json.stringify(updateObject)).asInstanceOf[DBObject]
      val result = collection.save(dbo, WriteConcern.Safe)

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



