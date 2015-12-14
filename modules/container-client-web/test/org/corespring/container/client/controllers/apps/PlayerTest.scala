package org.corespring.container.client.controllers.apps

import java.util.concurrent.TimeUnit

import org.corespring.container.client.{ItemAssetResolver, V2PlayerConfig}
import org.corespring.container.client.component.ComponentUrls
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.components.model.Component
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.test.TestContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.Mode.Mode
import play.api.http.{ HeaderNames, ContentTypes }
import play.api.{ GlobalSettings, Mode, Configuration }
import play.api.libs.json.{ Json, JsValue, JsObject }
import play.api.mvc.{ RequestHeader }
import play.api.test.{ FakeApplication, PlaySpecification, FakeRequest }

import scala.concurrent._
import scala.concurrent.duration.Duration

class PlayerTest extends Specification with PlaySpecification with Mockito {

  val sessionId = "sessionId"

  object MockGlobal extends GlobalSettings

  class playerScope(sessionAndItem: Either[(Int, String), (JsValue, JsValue)] = Right(Json.obj("id" -> sessionId, "itemId" -> "123"), Json.obj()))
    extends Scope
    with Player
    with TestContext{
    lazy val mockHooks = {
      val m = mock[PlayerHooks]
      m.loadSessionAndItem(any[String])(any[RequestHeader]) returns Future(sessionAndItem)
      m.createSessionForItem(any[String])(any[RequestHeader]) returns Future(sessionAndItem)
      m
    }

    override def hooks: PlayerHooks = mockHooks

    override def versionInfo: JsObject = Json.obj()

    override def itemPreProcessor: PlayerItemPreProcessor = {
      val m = mock[PlayerItemPreProcessor]
      m.preProcessItemForPlayer(any[JsValue]) returns Json.obj()
      m
    }

    override protected def buildJs(scriptInfo: ComponentScriptInfo, extras: Seq[String])(implicit rh: RequestHeader) = Seq.empty
    override protected def buildCss(scriptInfo: ComponentScriptInfo)(implicit rh: RequestHeader) = Seq.empty

    override def playerConfig: V2PlayerConfig = V2PlayerConfig(Configuration.empty)

    override def components: Seq[Component] = Seq.empty


    override def mode: Mode = Mode.Dev

    override def urls: ComponentUrls = {
      mock[ComponentUrls]
    }

    override def jsSrc: NgSourcePaths = {
      new NgSourcePaths(Seq.empty, "", Seq.empty, Seq.empty)
    }

    override def itemAssetResolver : ItemAssetResolver = new ItemAssetResolver{}
  }

  "load" should {

    "throw an error if the session id isn't defined" in new playerScope(Right(Json.obj(), Json.obj())) {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        Await.result(load(sessionId)(FakeRequest("", "")), Duration(1, TimeUnit.SECONDS)) must throwA[IllegalArgumentException]
      }
    }

    "return 200" in new playerScope {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result = load(sessionId)(FakeRequest("", ""))
        status(result) must_== OK
        there was one(mockHooks).loadSessionAndItem(sessionId)(FakeRequest("", ""))
      }
    }

    "call hooks.loadSessionAndItem" in new playerScope {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result = load(sessionId)(FakeRequest("", ""))
        there was one(mockHooks).loadSessionAndItem(sessionId)(FakeRequest("", ""))
      }
    }

    "return session as HTML" in new playerScope {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result = load(sessionId)(FakeRequest("", ""))
        header(HeaderNames.CONTENT_TYPE, result) must_== Some(ContentTypes.HTML)
      }
    }
  }

  "createSessionForItem" should {
    val itemId = "12334"

    "call playerHooks.createSessionForItem" in new playerScope {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        createSessionForItem(itemId)(FakeRequest("", ""))
        there was one(mockHooks).createSessionForItem(itemId)(FakeRequest("", ""))
      }
    }

    "return a 201" in new playerScope {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val request = FakeRequest("", "")
        val result = createSessionForItem(itemId)(request)
        status(result) must be equalTo (CREATED)
      }
    }

    "return new session as HTML" in new playerScope {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val request = FakeRequest("", "")
        val result = createSessionForItem(itemId)(request)
        header(HeaderNames.CONTENT_TYPE, result) must be equalTo (Some(ContentTypes.HTML))
      }
    }

    "sets the Location header to Player.load(sessionId)" in new playerScope {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val request = FakeRequest("", "")
        val result = createSessionForItem(itemId)(request)
        import org.corespring.container.client.controllers.apps.routes.Player
        header(HeaderNames.LOCATION, result) must be equalTo (Some(Player.load(sessionId).url))
      }
    }
  }
}
