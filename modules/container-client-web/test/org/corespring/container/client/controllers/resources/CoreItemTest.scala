package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.CoreItemHooks
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.Json
import play.api.mvc.AnyContentAsJson
import play.api.test.{ FakeHeaders, FakeRequest }
import play.api.test.Helpers._

import scala.concurrent.ExecutionContext

class CoreItemTest extends Specification with Mockito {

  class scope extends Scope with CoreItem {
    override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global

    override protected def componentTypes: Seq[String] = Seq.empty

    override def hooks: CoreItemHooks = {
      val m = mock[CoreItemHooks]
      m
    }
  }

  implicit val r = FakeRequest("", "", FakeHeaders(), AnyContentAsJson(Json.obj()))

  "saveSubset" should {

    "return an error if the subset is unknown" in new scope {
      val result = saveSubset("id", "thing")(r)
      status(result) === BAD_REQUEST
      (contentAsJson(result) \ "error").as[String] === "Unknown subset: thing"
    }

  }
}
