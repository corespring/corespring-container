package org.corespring.mongo.json.services

import com.mongodb._
import com.mongodb.casbah.commons.{ MongoDBList, MongoDBObject }
import com.mongodb.casbah.{ MongoCollection, MongoCursor }
import org.bson.types.ObjectId
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.Json

import scalaz.Success

class MongoServiceTest extends Specification with Mockito {

  "MongoService" should {

    "throw an exception on a bad insert" in {
      val mockCollection = mock[MongoCollection]
      mockCollection.name returns "mockCollection"
      val exception = new MongoException("bad insert")
      mockCollection.insert(any[Any], any[WriteConcern])(any[Any => DBObject]) throws exception
      val service = new MongoService(mockCollection)
      service.create(Json.obj()) must throwA(MongoServiceException("insert", "mockCollection", exception))
    }

    "throw an exception on a WriteResult error" in {
      val mockCollection = mock[MongoCollection]
      mockCollection.name returns "mockCollection"

      val result = mock[WriteResult]

      result.getLastError returns {
        val m = mock[CommandResult]
        m.ok returns false
        m.getErrorMessage returns "Some Message"
        m
      }

      mockCollection.insert(any[Any], any[WriteConcern])(any[Any => DBObject]) returns result
      val service = new MongoService(mockCollection)
      service.create(Json.obj()) must throwA(MongoServiceException("insert", "mockCollection", "Some Message"))
    }

    "loadMultiple" should {

      class loadMultipleScope() extends Scope {
        def mockResults: Seq[DBObject] = Seq()

        val mockCursor = mock[MongoCursor]
        mockCursor.toSeq returns mockResults
        val mockCollection = mock[MongoCollection]
        mockCollection.name returns "mockCollection"
        mockCollection.find(any[DBObject])(any[Any => DBObject]) returns mockCursor
        val service = new MongoService(mockCollection)
      }

      "return results from find as json" in new loadMultipleScope() {
        lazy val sessionId = "123456789012345678901234"
        override def mockResults = Seq(MongoDBObject("_id" -> sessionId, "components" -> MongoDBObject.empty))

        service.loadMultiple(Seq(sessionId)) === Seq(Json.obj("_id" -> sessionId, "components" -> Json.obj()))
      }

      "pass sessionIds in query" in new loadMultipleScope() {
        lazy val sessionIds = Seq("123456789012345678901234", "123456789012345678901235")
        override def mockResults = Seq()

        service.loadMultiple(sessionIds)

        there was one(mockCollection).find(
          MongoDBObject("_id" -> MongoDBObject("$in" ->
            sessionIds.map(new ObjectId(_)))))
      }
    }
  }
}
