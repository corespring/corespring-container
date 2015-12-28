package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.{ ItemMetadataHooks, CollectionHooks }
import org.corespring.test.TestContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.{ JsValue, JsArray, Json }
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest
import play.api.test.Helpers._

import scala.concurrent.Future

class ItemMetadataTest extends Specification with Mockito {

  class metadata(
    getResult: JsValue = Json.obj("key" -> "1", "value" -> "one"))
    extends Scope with ItemMetadata with TestContext {
    override def hooks: ItemMetadataHooks = {
      val m = mock[ItemMetadataHooks]
      m.get(any[String])(any[RequestHeader]) returns Future(Right(getResult))
      m
    }
  }

  "ItemMetadata" should {

    "get" should {
      s"return $OK" in new metadata {
        status(get("id")(FakeRequest("", ""))) === OK
      }
    }

  }
}
