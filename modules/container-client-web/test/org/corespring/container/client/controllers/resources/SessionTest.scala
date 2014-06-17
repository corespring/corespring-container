package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions._
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._
import play.api.test.{FakeHeaders, FakeRequest}
import play.api.test.Helpers._

import scala.concurrent.{ExecutionContext, Future}

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


    "allow save when session is not complete" in new ActionBody(saveSession(false)) {
      val result = session.saveSession("id")(FakeRequest("", "", FakeHeaders(), AnyContentAsJson(Json.obj())))
      status(result) === OK
    }

    "not allow save when session is complete" in new ActionBody(saveSession(true)) {
      val result = session.saveSession("id")(FakeRequest())
      status(result) === BAD_REQUEST
      (contentAsJson(result) \ "error").as[String] === Session.Errors.cantSaveWhenComplete
    }

    "not allow load outcome when session is complete, but there are no answers" in new ActionBody(outcome(isComplete = true)) {
      val result = session.loadOutcome("id")(FakeRequest())
      status(result) === BAD_REQUEST
    }

    "allow load outcome when session is complete" in new ActionBody(outcome(itemSession = Json.obj("components" -> Json.obj()), isComplete = true)) {
      val result = session.loadOutcome("id")(FakeRequest())
      status(result) === OK
    }

    "not allow load outcome when session is not complete" in new ActionBody(outcome(isComplete = false)) {
      val result = session.loadOutcome("id")(FakeRequest())
      status(result) === BAD_REQUEST
    }

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

  class ActionBody(mode: SecureMode) extends org.specs2.specification.Before {

    val session = new Session {
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

      override implicit def ec: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global
    }

    def before = {}
  }

  class MockBuilder(m: SecureMode) extends SessionHooks {

    import scala.concurrent.ExecutionContext.Implicits.global

    override def loadEverything(id: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, FullSession]] = ???

    override def getScore(id: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, SessionOutcome]] = Future{
      Right(m.asInstanceOf[SessionOutcome])
    }

    override def loadOutcome(id: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, SessionOutcome]] = Future{
        Right(m.asInstanceOf[SessionOutcome])
    }


    override def load(id: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, JsValue]] = ???

    override def save(id: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, SaveSession]] = Future{
      Right(m.asInstanceOf[SaveSession])
    }
  }

}
