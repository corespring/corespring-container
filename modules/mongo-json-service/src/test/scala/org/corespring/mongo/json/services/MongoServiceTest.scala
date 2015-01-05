package org.corespring.mongo.json.services

import com.mongodb._
import com.mongodb.casbah.MongoCollection
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import play.api.libs.json.Json

class MongoServiceTest extends Specification with Mockito{

  "MongoService" should {

    "throw an exception on a bad insert" in {
      val mockCollection = mock[MongoCollection]
      mockCollection.name returns "mockCollection"
      val exception = new MongoException("bad insert")
      mockCollection.insert(any[Any], any[WriteConcern])(any[Any => DBObject]) throws exception
      val service = new MongoService(mockCollection)
      service.create(Json.obj()) must throwA(MongoServiceException("insert","mockCollection",exception))
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
      service.create(Json.obj()) must throwA(MongoServiceException("insert","mockCollection","Some Message"))
    }
  }
}
