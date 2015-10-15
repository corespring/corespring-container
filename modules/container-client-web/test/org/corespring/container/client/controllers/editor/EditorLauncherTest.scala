package org.corespring.container.client.controllers.editor

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.controllers.EditorLauncher
import org.corespring.container.client.controllers.launcher.JsBuilder
import org.corespring.container.client.hooks.{PlayerJs, PlayerLauncherHooks}
import org.corespring.test.TestContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.mvc.{RequestHeader, Session}
import play.api.test.{FakeApplication, FakeRequest, PlaySpecification}
import play.api.{Configuration, GlobalSettings}

import scala.concurrent.Future

class EditorLauncherTest extends Specification with Mockito with PlaySpecification {

  val config = Map("rootUrl" -> "http://corespring.edu")

  class launchScope(val jsConfig: PlayerJs = PlayerJs(false, Session())) extends Scope with EditorLauncher with TestContext{

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

    override def hooks: PlayerLauncherHooks = new PlayerLauncherHooks with TestContext{
      override def editorJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)
      override def playerJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)
      override def catalogJs(implicit header: RequestHeader): Future[PlayerJs] = Future(jsConfig)
    }
  }

  object MockGlobal extends GlobalSettings

  implicit val r = FakeRequest("", "")

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


}
