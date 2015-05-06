package org.corespring.container.client.controllers

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

  class launchScope(jsConfig: PlayerJs) extends Scope {

    val launcher = new PlayerLauncher {

      override def playerConfig: V2PlayerConfig = V2PlayerConfig(Configuration.empty)

      override def hooks: PlayerLauncherHooks = new PlayerLauncherHooks {

        override def editorJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)

        override def playerJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)

        override def catalogJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)
      }

      override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global
    }
  }

  object MockGlobal extends GlobalSettings {

  }

  "playerJs" should {
    "return 200" in new launchScope(PlayerJs(false, Session())) {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val result = launcher.playerJs(FakeRequest("", ""))
        status(result) === OK
      }
    }
  }
}
