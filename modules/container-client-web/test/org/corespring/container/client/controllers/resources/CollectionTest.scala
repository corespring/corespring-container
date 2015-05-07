package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks.{ CollectionHooks, ItemHooks }
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.{JsArray, JsValue, Json}
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest
import play.api.test.Helpers._

import scala.concurrent.{ ExecutionContext, Future }

class CollectionTest extends Specification with Mockito {

  class collection(
    listResult: JsArray = Json.arr(Json.obj("key" -> "1", "value" -> "one"), Json.obj("key" -> "2", "value" -> "two")))
    extends Scope {

    val collection = new Collection {

      override def hooks: CollectionHooks = new CollectionHooks {

        override def list()(implicit header: RequestHeader): Future[Either[StatusMessage, JsArray]] = {
          Future {
            Right(listResult)
          }
        }

        override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global
      }

      override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global
    }

  }

  "Collection" should {

    "list" should {
      s"return $OK" in new collection {
        status(collection.list()(FakeRequest("", ""))) === OK
      }
    }

  }
}
