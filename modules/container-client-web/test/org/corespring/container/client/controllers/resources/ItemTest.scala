package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.Hooks.{ R, StatusMessage }
import org.corespring.container.client.hooks.{ ItemHooks, CoreItemHooks, CreateItemHook, SupportingMaterialHooks }
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.corespring.test.TestContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import org.specs2.time.NoTimeConversions
import play.api.libs.json.{ JsString, JsObject, JsValue, Json }
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest
import play.api.test.Helpers._
import play.api.mvc.Results._

import scala.concurrent.{ Await, Future }
import scala.concurrent.duration._

class ItemTest extends Specification with Mockito with ComponentMaker with NoTimeConversions {

  trait IH extends CoreItemHooks with CreateItemHook

  class item(
    createError: Option[StatusMessage] = None,
    loadResult: JsValue = Json.obj("_id" -> Json.obj("$oid" -> "1"), "xhtml" -> "<div></div>"))
    extends Scope {

    def components: Seq[Component] = Seq.empty

    val hooks: ItemHooks = {
      val m = mock[ItemHooks]
      m.createItem(any[Option[JsValue]])(any[RequestHeader]).returns {
        Future.successful {
          createError.map {
            e =>
              Left(e)
          }.getOrElse(Right("new_id"))
        }
      }
      m.createSingleComponentItem(any[String], any[String], any[JsObject])(any[RequestHeader]).returns {
        Future.successful {
          createError.map {
            e =>
              Left(e)
          }.getOrElse(Right("new_id"))
        }
      }
      m.load(any[String])(any[RequestHeader]).returns {
        Future.successful(Right(loadResult))
      }
      m
    }

    val item = new Item with TestContext {

      override def hooks: ItemHooks = item.this.hooks

      override protected def componentTypes: Seq[String] = Seq.empty

      override def materialHooks: SupportingMaterialHooks = {
        val m = mock[SupportingMaterialHooks]
        m
      }

      override def components: Seq[Component] = item.this.components
    }

  }

  "Item" should {

    "load" should {
      s"return $OK" in new item {
        status(item.load("x")(FakeRequest("", ""))) === OK
      }

      "prep the json" in new item(loadResult = Json.obj("_id" ->
        Json.obj("$oid" -> "1"), "xhtml" -> "<p>a</p>")) {
        val json = contentAsJson(item.load("x")(FakeRequest("", "")))
        (json \ "itemId").as[String] === "1"
        (json \ "xhtml").as[String] === """<div class="para">a</div>"""
      }
    }

    "create returns error" in new item(createError = Some(UNAUTHORIZED -> "Error")) {
      val result = item.create(FakeRequest("", ""))
      status(result) === UNAUTHORIZED
      contentAsJson(result) === Json.obj("error" -> "Error")
    }

    "create" in new item {
      val result = item.create(FakeRequest("", ""))
      status(result) === OK
      contentAsJson(result) === Json.obj("itemId" -> "new_id")
    }

    trait createWithSingleComponent extends item {
      override lazy val components = Seq(uiComp("type", Nil).copy(defaultData = Json.obj("defaultData" -> true)))
      val request = FakeRequest("", "")
      lazy val result = item.createWithSingleComponent("org-type")(request)
    }

    "createWithSingleComponent" should {
      s"returns $CREATED when successful" in new createWithSingleComponent {
        status(result) === CREATED
      }

      s"returns $NOT_FOUND when the interaction can't be found" in new createWithSingleComponent {
        override lazy val components = Seq.empty
        status(result) === NOT_FOUND
      }

      s"returns $NOT_FOUND when the interaction defaultData isn't a JsObject" in new createWithSingleComponent {
        override lazy val components = Seq(uiComp("type", Nil).copy(defaultData = JsString("hi")))
        status(result) === NOT_FOUND
      }

      s"calls hooks.createSingleComponentItem" in new createWithSingleComponent {
        Await.result(result, 1.second)
        there was one(hooks).createSingleComponentItem("org-type", "singleComponent", Json.obj("defaultData" -> true))(request)
      }

    }
  }
}
