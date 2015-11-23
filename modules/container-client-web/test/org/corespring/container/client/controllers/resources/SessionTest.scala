package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.Hooks._
import org.corespring.container.client.hooks._
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import org.corespring.test.TestContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import play.api.libs.json.{Json, JsValue}
import play.api.mvc._
import play.api.test.{FakeApplication, FakeHeaders, FakeRequest, WithApplication}
import play.api.test.Helpers._


import scala.concurrent.{ ExecutionContext, Future }

object mockGlobalS extends play.api.GlobalSettings

class SessionTest extends Specification with Mockito {

  "secure mode" should {

    def saveSession(isComplete: Boolean) = SaveSession(
      Json.obj(),
      true,
      isComplete,
      (a, b) => Some(Json.obj()))

    def outcome(itemSession: JsValue = Json.obj(), isComplete: Boolean) = SessionOutcome(
      Json.obj(),
      itemSession,
      true,
      isComplete)

    def fullSessionAndItem(isSecure:Boolean) = Right(FullSession(
      Json.obj(
        "item" -> Json.obj(),
        "session" -> Json.obj()
      ),
      isSecure
    ))

    "when saving" should {

      "allow save when session is not complete" in new ActionBody(saveSession(false)) {
        val result = session.saveSession("id")(FakeRequest("", "", FakeHeaders(), AnyContentAsJson(Json.obj())))
        status(result) === OK
      }

      "not allow save when session is complete" in new ActionBody(saveSession(true)) {
        val result = session.saveSession("id")(FakeRequest())
        status(result) === BAD_REQUEST
        (contentAsJson(result) \ "error").as[String] === Session.Errors.cantSaveWhenComplete
      }
    }

    "when loading outcome" should {

      "not allow load outcome when session is complete, but there are no answers" in new ActionBody(outcome(isComplete = true)) {
        val result = session.loadOutcome("id")(FakeRequest())
        status(result) === BAD_REQUEST
      }

      "allow load outcome when session is complete" in new ActionBody(outcome(itemSession = Json.obj("components" -> Json.obj()), isComplete = true)) {
        val result = session.loadOutcome("id")(FakeRequest("", "", FakeHeaders(), AnyContentAsJson(Json.obj())))
        status(result) === OK
      }

      "not allow load outcome when session is not complete" in new ActionBody(outcome(isComplete = false)) {
        val result = session.loadOutcome("id")(FakeRequest())
        status(result) === BAD_REQUEST
      }

    }

    "when scoring" should {

      "not allow load getScore when session is complete, but there are no answers" in new ActionBody(outcome(isComplete = true)) {
        val result = session.getScore("id")(FakeRequest())
        status(result) === BAD_REQUEST
      }

      "allow load getScore when session is complete" in new ActionBody(outcome(itemSession = Json.obj("components" -> Json.obj()), isComplete = true)) {
        val result = session.getScore("id")(FakeRequest())
        status(result) === OK
      }

      "not allow getScore when session is not complete" in new ActionBody(outcome(isComplete = false)) {
        val result = session.getScore("id")(FakeRequest())
        status(result) === BAD_REQUEST
      }
    }

    "when loading session and item" should {

      "return when session hooks returned failure" in new LoadItemAndSessionResponding(Left(BAD_REQUEST -> "")) {
        val result = session.loadItemAndSession("id")(FakeRequest())
        status(result) === BAD_REQUEST
      }

      "return session when session hooks succeeded" in new LoadItemAndSessionResponding(fullSessionAndItem(true)) {
        val result = session.loadItemAndSession("id")(FakeRequest())
        val asJson = contentAsJson(result)
        (asJson \ "item") === Json.obj()
        (asJson \ "session") === Json.obj()
        status(result) === OK
      }
    }

    "not allow to reset session" in new ActionBody(saveSession(true)) {
      val result = session.resetSession("id")(FakeRequest())
      status(result) === BAD_REQUEST
    }

    "not allow to reopen session" in new ActionBody(saveSession(true)) {
      val result = session.reopenSession("id")(FakeRequest())
      status(result) === BAD_REQUEST
    }

  }

  "not secure mode" should {

    def unsaveSession() = SaveSession(
      Json.obj("attempts" -> 123, "components" -> Json.arr(1, 2, 3)),
      isSecure = false,
      isComplete = true,
      (a, b) => Some(b))

    "allow to reset session" in new ActionBody(unsaveSession()) {
      val result = session.resetSession("id")(FakeRequest())
      status(result) === OK
      val resettedSession = contentAsJson(result)
      (resettedSession \ "isComplete").as[Boolean] === false
      (resettedSession \ "attempts").as[Int] === 0
      (resettedSession \ "components") === Json.obj()
    }

    "allow to reopen session" in new ActionBody(unsaveSession()) {
      val result = session.reopenSession("id")(FakeRequest())
      status(result) === OK
      val reopenedSession = contentAsJson(result)
      (reopenedSession \ "isComplete").as[Boolean] === false
      (reopenedSession \ "attempts").as[Int] === 0
    }

  }

  class LoadItemAndSessionResponding(hooksResponse: Either[StatusMessage, FullSession]) extends WithApplication(FakeApplication(withGlobal = Some(mockGlobalS))) with org.specs2.specification.Before {

    val session = new Session with TestContext {
      def outcomeProcessor: OutcomeProcessor = {
        val mocked = mock[OutcomeProcessor]
        mocked.createOutcome(any[JsValue], any[JsValue], any[JsValue]) returns Json.obj()
        mocked
      }

      def scoreProcessor: ScoreProcessor = {
        val mocked = mock[ScoreProcessor]
        mocked.score(any[JsValue], any[JsValue], any[JsValue]) returns Json.obj()
        mocked
      }

      def itemPreProcessor: PlayerItemPreProcessor = {
        val mocked = mock[PlayerItemPreProcessor]
        mocked.preProcessItemForPlayer(any[JsValue]) returns Json.obj()
        mocked
      }

      override def hooks: SessionHooks = new SessionHooks with TestContext{
        override def loadItemAndSession(id: String)(implicit header: RequestHeader): Either[StatusMessage, FullSession] = hooksResponse
        override def loadOutcome(id: String)(implicit header: RequestHeader): Either[(Int, String), SessionOutcome] = ???
        override def getScore(id: String)(implicit header: RequestHeader): Either[(Int, String), SessionOutcome] = ???
        override def load(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = ???
        override def save(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), SaveSession]] = ???
      }

    }

    def before = {}
  }

  class ActionBody(mode : SecureMode) extends WithApplication(FakeApplication(withGlobal = Some(mockGlobalS))) with org.specs2.specification.Before {

    val session = new Session with TestContext{
      def outcomeProcessor: OutcomeProcessor = {
        val mocked = mock[OutcomeProcessor]
        mocked.createOutcome(any[JsValue], any[JsValue], any[JsValue]) returns Json.obj()
        mocked
      }

      def scoreProcessor: ScoreProcessor = {
        val mocked = mock[ScoreProcessor]
        mocked.score(any[JsValue], any[JsValue], any[JsValue]) returns Json.obj()
        mocked
      }

      def itemPreProcessor: PlayerItemPreProcessor = mock[PlayerItemPreProcessor]

      override def hooks: SessionHooks = new MockBuilder(mode)

    }

    def before = {}
  }

  class MockBuilder(m: SecureMode) extends SessionHooks with TestContext{

    override def loadItemAndSession(id: String)(implicit header: RequestHeader): Either[StatusMessage, FullSession] = Right(m.asInstanceOf[FullSession])

    override def getScore(id: String)(implicit header: RequestHeader): Either[StatusMessage, SessionOutcome] =
      Right(m.asInstanceOf[SessionOutcome])

    override def load(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = ???

    override def save(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, SaveSession]] = Future {
      Right(m.asInstanceOf[SaveSession])
    }

    override def loadOutcome(id: String)(implicit header: RequestHeader): Either[(Int, String), SessionOutcome] = Right(m.asInstanceOf[SessionOutcome])
  }

}
