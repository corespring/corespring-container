package org.corespring.shell.impl.services

import com.mongodb.DBObject
import com.mongodb.casbah.MongoCollection
import com.mongodb.casbah.commons.MongoDBObject
import com.mongodb.util.JSON
import org.bson.types.ObjectId
import play.api.Logger
import play.api.libs.json.{JsObject, Json, JsValue}

class MongoService(collection: MongoCollection) {

  def logger = Logger("shell.mongo-service")

  def list(fields: String*): Seq[JsValue] = {

    val fieldsDbo = MongoDBObject(fields.toList.map(s => (s, 1)))
    collection.find(MongoDBObject(), fieldsDbo).toSeq.map {
      dbo =>
        val jsonString = JSON.serialize(dbo)
        logger.debug(s"found: $jsonString")
        Json.parse(jsonString)
    }
  }

  def load(id: String): Option[JsValue] = withOid(id) {
    oid =>
      val maybeDbo: Option[DBObject] = collection.findOneByID(oid)
      maybeDbo.map {
        dbo =>
          val s = JSON.serialize(dbo)
          Json.parse(s)
      }
  }

  def create(data:JsValue) : Option[ObjectId] = {

    val oid = ObjectId.get
    val jsonString = Json.stringify(data)
    logger.debug(s"[create] $jsonString")
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
      logger.debug(s"save $id : ${Json.stringify(data)}")

      val idObject = Json.obj("_id" ->
        Json.obj("$oid" -> id)
      )

      val updateObject = data.as[JsObject] ++ idObject

      val dbo = JSON.parse(Json.stringify(updateObject)).asInstanceOf[DBObject]
      val result = collection.save(dbo)

      if (result.getLastError.ok()) {
        Some(data)
      } else None
  }

  private def withOid(id: String)(block: ObjectId => Option[JsValue]): Option[JsValue] = if (ObjectId.isValid(id)) {
    val oid = new ObjectId(id)
    block(oid)
  } else None

}



