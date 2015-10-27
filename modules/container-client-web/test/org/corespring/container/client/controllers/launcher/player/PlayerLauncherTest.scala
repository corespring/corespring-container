package org.corespring.container.client.controllers.launcher.player

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.controllers.apps.routes._
import org.corespring.container.client.controllers.launcher.JsBuilder
import org.corespring.container.client.controllers.resources.routes._
import org.corespring.container.client.hooks.{ PlayerJs, PlayerLauncherHooks }
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.test.TestContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.JsObject
import play.api.mvc.{ RequestHeader, Session, SimpleResult }
import play.api.test.{ FakeApplication, FakeRequest, Helpers, PlaySpecification }
import play.api.{ Configuration, GlobalSettings }

import scala.concurrent.{ ExecutionContext, Future }

class PlayerLauncherTest extends Specification with Mockito with PlaySpecification {

  val config = Map("rootUrl" -> "http://corespring.edu")

  class launchScope(val jsConfig: PlayerJs = PlayerJs(false, Session())) extends Scope with PlayerLauncher with TestContext {

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

    override def hooks: PlayerLauncherHooks = new PlayerLauncherHooks with TestContext {
      override def editorJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)
      override def playerJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)
      override def catalogJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)

    }
  }

  object MockGlobal extends GlobalSettings

  implicit val r = FakeRequest("", "")

  "playerJs" should {

    "return non - secured player js" in new launchScope(PlayerJs(false, Session())) {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result: Future[SimpleResult] = playerJs(r)

        contentAsString(result) must_== new JsBuilder(playerConfig.rootUrl.get).build(playerNameAndSrc, mkPaths(Paths.player), Definitions.player(jsConfig.isSecure))(r, jsConfig)
        Helpers.session(result).get(SecureMode) must_== Some("false")
      }
    }

    "return secured player js" in new launchScope(PlayerJs(true, Session())) {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result: Future[SimpleResult] = playerJs(r)
        contentAsString(result) must_== new JsBuilder(playerConfig.rootUrl.get).build(playerNameAndSrc, mkPaths(Paths.player), Definitions.player(jsConfig.isSecure))(r, jsConfig)
        Helpers.session(result).get(SecureMode) must_== Some("true")
      }
    }
  }

  "editorJs" should {

    "return itemEditor and draftEditor definitions" in new launchScope(PlayerJs(false, Session())) {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result = editorJs(r)
        val nameAndSrc = Seq(draftEditorNameAndSrc, itemEditorNameAndSrc)
        val config = mkPaths(Paths.editors)
        contentAsString(result) must_== new JsBuilder(playerConfig.rootUrl.get).build(nameAndSrc, config, Definitions.editors)(r, jsConfig)
      }
    }
  }

  "Paths" should {

    class pathScope extends launchScope {
      def pathJson(config: JsObject, path: String) = (config \ path).as[JsObject]
    }

    "catalog paths" should {
      "point to load" in new pathScope() {
        pathJson(Paths.catalog, "catalog") === callToJson(Catalog.load(":itemId"))
      }
    }

    "itemEditor paths" should {
      "point to editor" in new pathScope() {
        pathJson(Paths.itemEditor, "editor") === callToJson(ItemEditor.load(":itemId"))
      }

      "point to devEditor" in new pathScope() {
        pathJson(Paths.itemEditor, "devEditor") === callToJson(ItemDevEditor.load(":itemId"))
      }

      "point to createItem" in new pathScope() {
        pathJson(Paths.itemEditor, "createItem") === callToJson(Item.create())
      }
    }

    "draftEditor paths" should {
      "point to editor" in new pathScope() {
        pathJson(Paths.draftEditor, "editor") === callToJson(DraftEditor.load(":draftId"))
      }

      "point to devEditor" in new pathScope() {
        pathJson(Paths.draftEditor, "devEditor") === callToJson(DraftDevEditor.load(":draftId"))
      }

      "point to createItemAndDraft" in new pathScope() {
        pathJson(Paths.draftEditor, "createItemAndDraft") === callToJson(ItemDraft.createItemAndDraft())
      }

      "point to commitDraft" in new pathScope() {
        pathJson(Paths.draftEditor, "commitDraft") === callToJson(ItemDraft.commit(":draftId"))
      }
    }

    "player paths" should {
      "point to createSession" in new pathScope() {
        pathJson(Paths.player, "createSession") === callToJson(Player.createSessionForItem(":id"))
      }

      "point to gather" in new pathScope() {
        pathJson(Paths.player, "gather") === callToJson(Player.load(":sessionId"))
      }

      "point to view" in new pathScope() {
        pathJson(Paths.player, "view") === callToJson(Player.load(":sessionId"))
      }

      "point to evaluate" in new pathScope() {
        pathJson(Paths.player, "evaluate") === callToJson(Player.load(":sessionId"))
      }
    }
  }
}
