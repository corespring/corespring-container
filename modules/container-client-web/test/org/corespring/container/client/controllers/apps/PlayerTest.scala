package org.corespring.container.client.controllers.apps

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.component.{ComponentBundler, ComponentsScriptBundle}
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.pages.PlayerRenderer
import org.corespring.container.components.model.Id
import org.corespring.container.components.services.ComponentService
import org.corespring.test.TestContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import org.specs2.time.NoTimeConversions
import play.api.http.{ContentTypes, HeaderNames}
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.mvc.RequestHeader
import play.api.templates.Html
import play.api.test.{FakeApplication, FakeRequest, PlaySpecification}
import play.api.{GlobalSettings, Mode}

import scala.concurrent._
import scala.concurrent.duration._

class PlayerTest extends Specification with PlaySpecification with Mockito
  with NoTimeConversions {

  val sessionId = "sessionId"
  val itemId = "itemId"

  object MockGlobal extends GlobalSettings

  implicit lazy val app = FakeApplication(withGlobal = Some(MockGlobal))

  class playerScope(sessionAndItem: Either[(Int, String), (JsValue, JsValue, JsValue)] = Right(Json.obj("id" -> sessionId), Json.obj(), Json.obj()))
    extends Scope
    with TestContext {


    lazy val hooks = {
      val m = mock[PlayerHooks]
      m.loadSessionAndItem(any[String])(any[RequestHeader]) returns Future(sessionAndItem)
      m.createSessionForItem(any[String])(any[RequestHeader]) returns Future(sessionAndItem)
      m
    }

    val bundler = {
      val m = mock[ComponentBundler]
      m.bundle(any[Seq[Id]], any[String], any[Option[String]], any[Boolean], any[Option[String]]) returns {
        Some(ComponentsScriptBundle(Nil, Nil, Nil, Nil))
      }
      m
    }

    val playerRenderer = {
      val m = mock[PlayerRenderer]
      m.render(any[String], any[JsValue], any[JsValue], any[ComponentsScriptBundle], any[Seq[String]], any[Map[String, String]], any[Boolean], any[Boolean], any[String], any[JsObject]) returns {
        Future.successful(Html("<html></html>"))
      }
      m
    }

    val componentService = {
      val m = mock[ComponentService]
      m
    }

    val mode = Mode.Prod

    val playerConfig = V2PlayerConfig(None, None)
    val player = new Player(
      mode,
      bundler,
      containerContext,
      playerRenderer,
      componentService,
      hooks,
      playerConfig)

    def waitFor[A](f: Future[A]): A = Await.result(f, 1.second)
    val req = FakeRequest("", "")
  }

  "load" should {

    "call hooks.loadSessionAndItem" in running(app)(new playerScope {
      val result = player.load(itemId, Some(sessionId))(req)
      there was one(hooks).loadSessionAndItem(sessionId)(req)
    })

    "return session as HTML" in running(app)(new playerScope {
      val result = player.load(itemId, Some(sessionId))(req)
      header(HeaderNames.CONTENT_TYPE, result) must_== Some(ContentTypes.HTML)
    })
  }

  "createSessionForItem" should {
    val itemId = "12334"

    "call playerHooks.createSessionForItem" in new playerScope {
      player.createSessionForItem(itemId)(req)
      there was one(hooks).createSessionForItem(itemId)(req)
    }

    "return a 201" in new playerScope {
      val result = player.createSessionForItem(itemId)(req)
      status(result) must be equalTo (CREATED)
    }

    "return new session as HTML" in new playerScope {
      val result = player.createSessionForItem(itemId)(req)
      header(HeaderNames.CONTENT_TYPE, result) must be equalTo (Some(ContentTypes.HTML))
    }

    "sets the Location header to Player.load(sessionId)" in new playerScope {
      val result = player.createSessionForItem(itemId)(req)
      import org.corespring.container.client.controllers.apps.routes.Player
      header(HeaderNames.LOCATION, result) must be equalTo (Some(Player.load(itemId, Some(sessionId)).url))
    }
  }
}
