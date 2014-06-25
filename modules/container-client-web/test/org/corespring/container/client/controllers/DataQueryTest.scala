package org.corespring.container.client.controllers

import org.corespring.container.client.hooks.DataQueryHooks
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import play.api.libs.json.JsArray
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest
import play.api.test.Helpers._

import scala.concurrent.Future

class DataQueryTest extends Specification with Mockito {

  "data query" should {

    val dq = new DataQuery {
      override def hooks: DataQueryHooks = {
        val m = mock[DataQueryHooks]
        m.list(anyString, any[Option[String]])(any[RequestHeader]) returns Future(Right(JsArray(Seq.empty)))
        m
      }
    }

    "return an error for an invalid topic" in {
      val result = dq.list("bad-topic")(FakeRequest("", ""))
      status(result) === BAD_REQUEST
    }

    "return OK" in {
      val result = dq.list("itemType")(FakeRequest("", ""))
      status(result) === OK
    }
  }
}
