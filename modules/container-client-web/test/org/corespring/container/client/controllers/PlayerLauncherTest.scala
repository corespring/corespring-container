package org.corespring.container.client.controllers

import org.corespring.container.client.controllers.apps.routes._
import org.corespring.container.client.controllers.resources.routes._
import play.api.libs.json.Json

import scala.concurrent.{ ExecutionContext, Future }

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.hooks.{ PlayerJs, PlayerLauncherHooks }
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.{ Configuration, GlobalSettings }
import play.api.mvc.{ SimpleResult, RequestHeader, Session }
import play.api.test.{ Helpers, FakeApplication, FakeRequest, PlaySpecification }

class PlayerLauncherTest extends Specification with Mockito with PlaySpecification {

  val config = Map("rootUrl" -> "http://corespring.edu")

  class launchScope(val jsConfig: PlayerJs) extends Scope with PlayerLauncher {

    val mockConfig = mock[Configuration]
    mockConfig.getConfig("corespring.v2player").returns({
      val v2Config = mock[Configuration]
      config.foreach {
        case (key, value) => {
          v2Config.getString(key).returns(config.get(key))
        }
      }
      Some(v2Config)
    })

    override def playerConfig: V2PlayerConfig = V2PlayerConfig(mockConfig)

    override def hooks: PlayerLauncherHooks = new PlayerLauncherHooks {
      override def editorJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)
      override def playerJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)
      override def catalogJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)
    }
    override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global
  }

  object MockGlobal extends GlobalSettings

  "playerJs" should {

    "return non - secured player js" in new launchScope(PlayerJs(false, Session())) {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result: Future[SimpleResult] = playerJs(FakeRequest("", ""))
        contentAsString(result) must_== new JsBuilder(playerConfig.rootUrl.get).build(playerNameAndSrc, LaunchOptions.player, Definitions.player(jsConfig.isSecure))(FakeRequest("", ""), jsConfig)
        Helpers.session(result).get(SecureMode) must_== Some("false")
      }
    }

    "return secured player js" in new launchScope(PlayerJs(true, Session())) {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result: Future[SimpleResult] = playerJs(FakeRequest("", ""))
        contentAsString(result) must_== new JsBuilder(playerConfig.rootUrl.get).build(playerNameAndSrc, LaunchOptions.player, Definitions.player(jsConfig.isSecure))(FakeRequest("", ""), jsConfig)
        Helpers.session(result).get(SecureMode) must_== Some("true")
      }
    }

    /*"return 200" in new launchScope(PlayerJs(false, Session())) {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result = launcher.playerJs(FakeRequest("", ""))
        status(result) === OK
      }
    }*/

    /*"return non-empty content" in new launchScope(PlayerJs(false, Session())) {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result = launcher.playerJs(FakeRequest("", ""))
        contentAsString(result) must not beEmpty
      }
    }*/

  }

  /*"defaultOptions" should {

    var url = "http://localhost:9000"

    class defaultOptions extends launchScope(PlayerJs(false, Session())) {
      val catalogOptions = launcher.defaultOptions.catalog(FakeRequest("GET", url))
      val editorOptions = launcher.defaultOptions.editor(FakeRequest("GET", url))
      val playerOptions = launcher.defaultOptions.player(FakeRequest("GET", url))
    }

    "catalog" should {

      "set corespringUrl from configuration" in new defaultOptions {
        (catalogOptions \ "corespringUrl").asOpt[String] must be equalTo(config.get("rootUrl"))
      }

      "paths" should {

        "direct catalog to Catalog.load" in new defaultOptions {
          (catalogOptions \ "paths" \ "catalog").as[String] must be equalTo(Catalog.load(":itemId").url)
        }

      }

    }

    "editor" should {

      "set corespringUrl from configuration" in new defaultOptions {
        (editorOptions \ "corespringUrl").asOpt[String] must be equalTo(config.get("rootUrl"))
      }

      "paths" should {

        "direct sessionUrl to Player.createSession" in new defaultOptions {
          (editorOptions \ "paths" \ "sessionUrl").as[String] must be equalTo(Player.createSession(":id").url)
        }

        "direct editor to Editor.load" in new defaultOptions {
          (editorOptions \ "paths" \ "editor").as[String] must be equalTo(Editor.load(":draftId").url)
        }

        "direct devEditor to DevEditor.load" in new defaultOptions {
          (editorOptions \ "paths" \ "devEditor").as[String] must be equalTo(DevEditor.load(":draftId").url)
        }

        "direct createItemAndDraft to ItemDraft.createItemAndDraft" in new defaultOptions {
          (editorOptions \ "paths" \ "createItemAndDraft").as[String] must be equalTo(ItemDraft.createItemAndDraft().url)
        }

        "direct commitDraft to ItemDraft.commit" in new defaultOptions {
          (editorOptions \ "paths" \ "commitDraft").as[String] must be equalTo(ItemDraft.commit(":draftId").url)
        }
      }

    }

    "player" should {

      "set corespringUrl from configuration" in new defaultOptions {
        (playerOptions \ "corespringUrl").asOpt[String] must be equalTo(config.get("rootUrl"))
      }

      "have mode set to gather" in new defaultOptions {
        (playerOptions \ "mode").as[String] must be equalTo("gather")
      }

      "paths" should {

        "direct sessionUrl to Player.createSession" in new defaultOptions {
          (playerOptions \ "paths" \ "sessionUrl").as[String] must be equalTo(Player.createSession(":id").url)
        }

        "direct gather to Player.load" in new defaultOptions {
          (playerOptions \ "paths" \ "gather").as[String] must be equalTo(Player.load(":sessionId").url)
        }

        "direct view to Player.load" in new defaultOptions {
          (playerOptions \ "paths" \ "view").as[String] must be equalTo(Player.load(":sessionId").url)
        }

        "direct evaluate to Player.load" in new defaultOptions {
          (playerOptions \ "paths" \ "evaluate").as[String] must be equalTo(Player.load(":sessionId").url)
        }

      }

    }

  }
 */
}
