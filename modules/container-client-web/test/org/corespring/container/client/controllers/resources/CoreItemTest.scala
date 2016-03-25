package org.corespring.container.client.controllers.resources

import org.corespring.container.client.controllers.helpers.PlayerXhtml
import org.corespring.container.client.hooks.{ CoreItemHooks, SupportingMaterialHooks }
import org.corespring.test.TestContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.http.HeaderNames
import play.api.libs.json.{ JsObject, JsValue, Json }
import play.api.mvc.{ AnyContent, AnyContentAsJson, Request, RequestHeader }
import play.api.test.Helpers._
import play.api.test.{ FakeHeaders, FakeRequest }

import scala.concurrent.Future

class CoreItemTest extends Specification with Mockito {

  class scope extends Scope with CoreItem with TestContext {

    override protected def componentTypes: Seq[String] = Seq.empty

    val mockHooks: CoreItemHooks = {
      val m = mock[CoreItemHooks]
      m.saveComponents(any[String], any[JsValue])(any[Request[AnyContent]]) returns Future(Right(Json.obj()))
      m.saveCollectionId(any[String], any[String])(any[Request[AnyContent]]) returns Future(Right(Json.obj()))
      m.saveCustomScoring(any[String], any[String])(any[Request[AnyContent]]) returns Future(Right(Json.obj()))
      m.saveProfile(any[String], any[JsValue])(any[Request[AnyContent]]) returns Future(Right(Json.obj()))
      m.saveSupportingMaterials(any[String], any[JsValue])(any[Request[AnyContent]]) returns Future(Right(Json.obj()))
      m.saveSummaryFeedback(any[String], any[String])(any[Request[AnyContent]]) returns Future(Right(Json.obj()))
      m.saveXhtml(any[String], any[String])(any[Request[AnyContent]]) returns Future(Right(Json.obj()))
      m
    }

    override def hooks: CoreItemHooks = mockHooks

    override def materialHooks: SupportingMaterialHooks = {
      val m = mock[SupportingMaterialHooks]
      m
    }

    override def playerXhtml: PlayerXhtml = {
      val m = mock[PlayerXhtml]
      m.processXhtml(any[String]) answers { s => s.asInstanceOf[String] }
      m
    }
  }

  def req(json: JsObject) = FakeRequest("", "", FakeHeaders(), AnyContentAsJson(json))

  implicit val r = req(Json.obj("data" -> "hi"))

  "load" should {
    "set cache control headers" in new scope {
      mockHooks.load(any[String])(any[Request[AnyContent]]) returns Future(Right(Json.obj("xhtml" -> "")))
      val result = load("itemid")(r)
      header(HeaderNames.CACHE_CONTROL, result) === Some(noCacheHeader)
      header(HeaderNames.EXPIRES, result) === Some("0")
    }
  }

  "saveXhtmlAndComponents" should {

    "return an error if 'xhtml' is missing" in new scope {
      val result = saveXhtmlAndComponents("id")(req(Json.obj()))
      status(result) must_== BAD_REQUEST
    }

    "return an error if 'components' is missing" in new scope {
      val result = saveXhtmlAndComponents("id")(req(Json.obj("xhtml" -> "<div></div>")))
      status(result) must_== BAD_REQUEST
    }

    "return an error if 'components' isn't an object" in new scope {
      val result = saveXhtmlAndComponents("id")(req(Json.obj("xhtml" -> "<div></div>", "components" -> "HI")))
      status(result) must_== BAD_REQUEST
    }

    "return hooks.saveXhtmlAndComponents error" in new scope {
      hooks.saveXhtmlAndComponents(any[String], any[String], any[JsValue])(any[RequestHeader]) returns Future.successful(Left(500, "Hook err"))
      val result = saveXhtmlAndComponents("id")(req(Json.obj("xhtml" -> "<div></div>", "components" -> Json.obj())))
      contentAsJson(result) must_== Json.obj("error" -> "Hook err")
    }

    "return hooks.saveXhtmlAndComponents result" in new scope {
      hooks.saveXhtmlAndComponents(any[String], any[String], any[JsValue])(any[RequestHeader]) returns Future.successful(Right(Json.obj("success" -> true)))
      val result = saveXhtmlAndComponents("id")(req(Json.obj("xhtml" -> "<div></div>", "components" -> Json.obj())))
      contentAsJson(result) must_== Json.obj("success" -> true)
    }
  }

  "saveSubset" should {

    "return an error if the subset is unknown" in new scope {
      val result = saveSubset("id", "thing")(r)
      status(result) === BAD_REQUEST
      (contentAsJson(result) \ "error").as[String] === "Unknown subset: thing"
    }

    def camelise(snakeString: String) = {
      val split = snakeString.split("-").toSeq
      val joined = split.head :+ split.tail.map(_.capitalize).mkString
      joined.mkString
    }

    class saveScope(val key: String) extends scope {
      val camelCase = camelise(key)
      lazy val request = req(Json.obj(camelCase -> key))
      saveSubset("id", key)(request)
    }

    "call hooks.saveCustomScoring" in new saveScope("custom-scoring") {
      there was one(mockHooks).saveCustomScoring("id", key)(request)
    }

    "call hooks.saveCollectionId" in new saveScope("collection-id") {
      there was one(mockHooks).saveCollectionId("id", key)(request)
    }

    "call hooks.saveProfile" in new saveScope("profile") {
      there was one(mockHooks).saveProfile("id", Json.obj(camelCase -> key))(request)
    }

    "call hooks.saveComponents" in new saveScope("components") {
      there was one(mockHooks).saveComponents("id", Json.obj(camelCase -> key))(request)
    }

    "call hooks.saveSummaryFeedback" in new saveScope("summary-feedback") {
      there was one(mockHooks).saveSummaryFeedback("id", key)(request)
    }

    "call hooks.saveXhtml" in new saveScope("xhtml") {
      there was one(mockHooks).saveXhtml("id", "<div>xhtml</div>")(request)
    }

  }
}
