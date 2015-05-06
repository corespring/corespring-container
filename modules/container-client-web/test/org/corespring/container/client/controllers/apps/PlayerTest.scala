package org.corespring.container.client.controllers.apps

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.component.ComponentUrls
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.components.model.Component
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import play.api.{GlobalSettings, Mode, Configuration}
import play.api.libs.json.{Json, JsValue, JsObject}
import play.api.mvc.{SimpleResult, AnyContent, Request, RequestHeader}
import play.api.test.{FakeApplication, PlaySpecification, FakeRequest}

import scala.concurrent._

class PlayerTest extends Specification with PlaySpecification with Mockito {

  val validSessionId = "valid-session-id"
  val validSession = Json.obj("this" -> "is", "a" -> "session")

  val newSessionId = "new-session-id"
  val newSession = Json.obj("this" -> "is", "a" -> "brand", "new" -> "session")

  val sessions = Map(
    newSessionId -> (newSession, Json.obj()),
    validSessionId -> (validSession, Json.obj())
  )

  val mockCreateSession: (String => Either[(Int, String), String]) = mock[(String => Either[(Int, String), String])]
  mockCreateSession.apply(any[String]).returns(Right(newSessionId))

  object MockGlobal extends GlobalSettings

  lazy val player = new Player {
    override def versionInfo: JsObject = Json.obj()
    override def itemPreProcessor = new PlayerItemPreProcessor {
      override def preProcessItemForPlayer(item: JsValue) = Json.obj()
    }
    override def playerConfig: V2PlayerConfig = V2PlayerConfig(Configuration.empty)
    override def urls: ComponentUrls = new ComponentUrls {
      override def jsUrl(context: String, components: Seq[Component], separatePaths: Boolean) = Seq.empty
      override def cssUrl(context: String, components: Seq[Component], separatePaths: Boolean) = Seq.empty
    }
    override def components = Seq.empty
    override def mode = Mode.Test
    override def hooks: PlayerHooks = new PlayerHooks {
      override def createSessionForItem(itemId: String)(implicit header: RequestHeader): Future[Either[(Int, String), String]] = Future {
        mockCreateSession.apply(itemId)
      }
      override def loadSessionAndItem(sessionId: String)(implicit header: RequestHeader): Future[Either[(Int, String), (JsValue, JsValue)]] = Future {
        sessions.get(sessionId).map(Right(_)).getOrElse(Left(NOT_FOUND -> "Can't find item or session"))
      }
      override def loadFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult = Ok("")
      override def load(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
        Future { Left(0, "") }
    }
    override implicit def ec: ExecutionContext = ExecutionContext.global
  }

  val session = ""

  "load" should {

    "return session as JSON" in {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val request = FakeRequest("", "")
        val result = player.load(validSessionId)(request)
        header("Content-Type", result) must be equalTo(Some("application/json"))
        contentAsJson(result) must be equalTo(validSession)
      }
    }

    "with Accepts text/html" should {

      "return session as HTML" in {
        running(FakeApplication(withGlobal = Some(MockGlobal))) {
          val request = FakeRequest("", "").withHeaders("Accept" -> "text/html")
          val result = player.load(validSessionId)(request)
          header("Content-Type", result).get must contain("text/html")
        }
      }
    }

    "with Accepts application/json and text/html" in {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val request = FakeRequest("", "").withHeaders("Accept" -> "application/json text/html")
        val result = player.load(validSessionId)(request)
        header("Content-Type", result) must be equalTo(Some("application/json"))
        contentAsJson(result) must be equalTo(validSession)
      }
    }

  }

  "createSession" should {
    val itemId = "12334"

    "create a session" in {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val request = FakeRequest("", "")
        player.createSession(itemId)(request)
        there was one(mockCreateSession).apply(itemId)
      }
    }

    "return new session as JSON" in {
      running(FakeApplication(withGlobal = Some(MockGlobal))) {
        val request = FakeRequest("", "")
        val result = player.createSession(itemId)(request)
        header("Content-Type", result) must be equalTo(Some("application/json"))
        contentAsJson(result) must be equalTo(newSession)
      }
    }

    "with Accepts text/html" should {

      "return new session as HTML" in {
        running(FakeApplication(withGlobal = Some(MockGlobal))) {
          val request = FakeRequest("", "").withHeaders("Accept" -> "text/html")
          val result = player.createSession(itemId)(request)
          header("Content-Type", result).get must contain("text/html")
        }
      }
    }


  }

}
