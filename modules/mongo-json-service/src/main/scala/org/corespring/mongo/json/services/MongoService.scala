package org.corespring.mongo.json.services

import com.mongodb.DBObject
import com.mongodb.casbah.{ WriteConcern, MongoCollection }
import com.mongodb.casbah.commons.MongoDBObject
import com.mongodb.util.{ JSON => MongoPlayJson }
import org.bson.types.ObjectId
import play.api.Logger
import play.api.libs.json.{Json => PlayJson, JsUndefined, JsArray, JsObject, JsValue}

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

  def delete(id:String) : Unit = {
    collection.findAndRemove(MongoDBObject("_id" -> new ObjectId(id)))
  }

  implicit class SupportingMaterialJson(jsValue: JsValue) {

    def addSupportingMaterialIds = jsValue match {
      case json: JsObject => (json \ "supportingMaterials") match {
        case array: JsArray => json ++ PlayJson.obj("supportingMaterials" ->
          JsArray(array.as[Seq[JsObject]].map(supportingMaterial => (supportingMaterial \ "id") match {
            case _: JsUndefined => supportingMaterial ++ PlayJson.obj("id" -> new ObjectId().toString)
            case _ => supportingMaterial
          })))
        case _ => json
      }
      case _ => jsValue
    }

  }

  def save(id: String, data: JsValue): Option[JsValue] = withOid(id) {
    oid =>
      logger.debug(s"[save]: $id")
      logger.trace(s"[save]: ${PlayJson.stringify(data)}")

      def toDbo(json: JsValue): DBObject = {
        MongoPlayJson.parse(PlayJson.stringify(json.addSupportingMaterialIds)).asInstanceOf[DBObject]
      }
      def toJson(dbo: DBObject) = PlayJson.parse(MongoPlayJson.serialize(dbo))
      val q = MongoDBObject("_id" -> new ObjectId(id))

      val setDbo = toDbo(data)
      setDbo.removeField("_id")
      logger.trace(s"set dbo: $setDbo")
      val d = MongoDBObject("$set" -> setDbo)
      val result = collection.update(q, d, false, false, WriteConcern.Safe)

      if (result.getLastError(WriteConcern.Safe).ok()) {
        val dbo = collection.findOneByID(new ObjectId(id))
        dbo.map(toJson)
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

