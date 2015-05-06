package org.corespring.container.client.controllers

import org.corespring.container.client.controllers.apps.routes._

import scala.concurrent.{ ExecutionContext, Future }

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.hooks.{ PlayerJs, PlayerLauncherHooks }
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.{ Configuration, GlobalSettings }
import play.api.mvc.{ RequestHeader, Session }
import play.api.test.{ FakeApplication, FakeRequest, PlaySpecification }

class PlayerLauncherTest extends Specification with Mockito with PlaySpecification {

  val config = Map("rootUrl" -> "http://corespring.edu")

  class launchScope(jsConfig: PlayerJs) extends Scope {

    val launcher = new PlayerLauncher {

      val mockConfig = mock[Configuration]
      mockConfig.getConfig("corespring.v2player").returns({
        val v2Config = mock[Configuration]
        config.foreach{case (key, value) => {
          v2Config.getString(key).returns(config.get(key))
        }}
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
  }

  object MockGlobal extends GlobalSettings

  "playerJs" should {

    "return 200" in new launchScope(PlayerJs(false, Session())) {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result = launcher.playerJs(FakeRequest("", ""))
        status(result) === OK
      }
    }

    "return non-empty content" in new launchScope(PlayerJs(false, Session())) {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result = launcher.playerJs(FakeRequest("", ""))
        contentAsString(result) must not beEmpty
      }
    }

  }

  "defaultOptions" should {

    var url = "http://localhost:9000"

    class defaultOptions extends launchScope(PlayerJs(false, Session())) {
      val playerOptions = launcher.defaultOptions.player(FakeRequest("GET", url))
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

}
