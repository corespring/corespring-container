package org.corespring.container.client.controllers

import org.corespring.container.client.controllers.apps.routes._
import org.corespring.container.client.controllers.launcher.JsBuilder
import org.corespring.container.client.controllers.resources.routes._
import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json.{ JsObject, Json }

import scala.concurrent.{ ExecutionContext, Future }

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.hooks.{ PlayerJs, PlayerLauncherHooks }
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.{ Configuration, GlobalSettings }
import play.api.mvc.{ Call, SimpleResult, RequestHeader, Session }
import play.api.test.{ Helpers, FakeApplication, FakeRequest, PlaySpecification }

class PlayerLauncherTest extends Specification with Mockito with PlaySpecification {

  val config = Map("rootUrl" -> "http://corespring.edu")

  class launchScope(val jsConfig: PlayerJs = PlayerJs(false, Session())) extends Scope with PlayerLauncher {

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
  }

  "LaunchOptions" should {

    class pathScope extends launchScope {
      def pathJson(config: JsObject, path: String) = (config \ "paths" \ path).as[JsObject]
    }

    "catalog paths" should {
      "point to load" in new pathScope() {
        pathJson(LaunchOptions.catalog, "catalog") === callToJson(Catalog.load(":itemId"))
      }
    }

    "editor paths" should {
      "point to editor" in new pathScope() {
        pathJson(LaunchOptions.editor, "editor") === callToJson(Editor.load(":draftId"))
      }

      "point to devEditor" in new pathScope() {
        pathJson(LaunchOptions.editor, "devEditor") === callToJson(DevEditor.load(":draftId"))
      }

      "point to createItemAndDraft" in new pathScope() {
        pathJson(LaunchOptions.editor, "createItemAndDraft") === callToJson(ItemDraft.createItemAndDraft())
      }

      "point to commitDraft" in new pathScope() {
        pathJson(LaunchOptions.editor, "commitDraft") === callToJson(ItemDraft.commit(":draftId"))
      }
    }

    "player paths" should {
      "point to createSession" in new pathScope() {
        pathJson(LaunchOptions.player, "createSession") === callToJson(Player.createSessionForItem(":id"))
      }

      "point to gather" in new pathScope() {
        pathJson(LaunchOptions.player, "gather") === callToJson(Player.load(":sessionId"))
      }

      "point to view" in new pathScope() {
        pathJson(LaunchOptions.player, "view") === callToJson(Player.load(":sessionId"))
      }

      "point to evaluate" in new pathScope() {
        pathJson(LaunchOptions.player, "evaluate") === callToJson(Player.load(":sessionId"))
      }
    }
  }
}
