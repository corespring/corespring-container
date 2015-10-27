package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.CollectionHooks
import org.corespring.test.TestContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.{JsArray, Json}
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest
import play.api.test.Helpers._

import scala.concurrent.Future

class CollectionTest extends Specification with Mockito {

  class collection(
    listResult: JsArray = Json.arr(Json.obj("key" -> "1", "value" -> "one"), Json.obj("key" -> "2", "value" -> "two")))
    extends Scope with Collection with TestContext{


      override def hooks : CollectionHooks = {
        val m = mock[CollectionHooks]
        m.list()(any[RequestHeader]) returns Future(Right(listResult))
        m
      }

  }

  "Collection" should {

    "list" should {
      s"return $OK" in new collection {
        status(list()(FakeRequest("", ""))) === OK
      }
    }

  }
}
