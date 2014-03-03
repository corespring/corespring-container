package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions._
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.{ Request, Action, Result, AnyContent }
import play.api.test.FakeRequest
import play.api.test.Helpers._

class SessionTest extends Specification with Mockito {

  "secure mode" should {

    def saveRequest(isComplete: Boolean) = SaveSessionRequest[AnyContent](
      Json.obj(),
      true,
      isComplete,
      (a, b) => Some(Json.obj()),
      FakeRequest().withJsonBody(Json.obj()))

    def outcomeRequest(itemSession: JsValue = Json.obj(), isComplete: Boolean) = SessionOutcomeRequest[AnyContent](
      Json.obj(),
      itemSession,
      true,
      isComplete,
      FakeRequest().withJsonBody(Json.obj()))

    "allow save when session is not complete" in new ActionBody(saveRequest(false)) {
      val result = session.saveSession("id")(FakeRequest())
      status(result) === OK
    }

    "not allow save when session is complete" in new ActionBody(saveRequest(true)) {
      val result = session.saveSession("id")(FakeRequest())
      status(result) === BAD_REQUEST
    }

    "not allow load outcome when session is complete, but there are no answers" in new ActionBody(outcomeRequest(isComplete = true)) {
      val result = session.loadOutcome("id")(FakeRequest())
      status(result) === BAD_REQUEST
    }

    "allow load outcome when session is complete" in new ActionBody(outcomeRequest(itemSession = Json.obj("components" -> Json.obj()), isComplete = true)) {
      val result = session.loadOutcome("id")(FakeRequest())
      status(result) === OK
    }

    "not allow load outcome when session is not complete" in new ActionBody(outcomeRequest(isComplete = false)) {
      val result = session.loadOutcome("id")(FakeRequest())
      status(result) === BAD_REQUEST
    }

    "not allow load getScore when session is complete, but there are no answers" in new ActionBody(outcomeRequest(isComplete = true)) {
      val result = session.getScore("id")(FakeRequest())
      status(result) === BAD_REQUEST
    }

    "allow load getScore when session is complete" in new ActionBody(outcomeRequest(itemSession = Json.obj("components" -> Json.obj()), isComplete = true)) {
      val result = session.getScore("id")(FakeRequest())
      status(result) === OK
    }

    "not allow getScore when session is not complete" in new ActionBody(outcomeRequest(isComplete = false)) {
      val result = session.getScore("id")(FakeRequest())
      status(result) === BAD_REQUEST
    }

  }

  class ActionBody(request: SecureModeRequest[AnyContent]) extends org.specs2.specification.Before {

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

      def actions: SessionActions[AnyContent] = new MockBuilder(request)
    }

    def before = {}
  }

  class MockBuilder(r: Request[AnyContent]) extends SessionActions[AnyContent] {
    def loadEverything(id: String)(block: (FullSessionRequest[AnyContent]) => Result): Action[AnyContent] = ???

    def load(id: String)(block: (FullSessionRequest[AnyContent]) => Result): Action[AnyContent] = ???

    def loadOutcome(id: String)(block: (SessionOutcomeRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        block(r.asInstanceOf[SessionOutcomeRequest[AnyContent]])
    }

    def getScore(id: String)(block: (SessionOutcomeRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        block(r.asInstanceOf[SessionOutcomeRequest[AnyContent]])
    }

    def checkScore(id: String)(block: (SessionOutcomeRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        block(r.asInstanceOf[SessionOutcomeRequest[AnyContent]])
    }

    def submitAnswers(id: String)(block: (SubmitSessionRequest[AnyContent]) => Result): Action[AnyContent] = ???

    def save(id: String)(block: (SaveSessionRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        block(r.asInstanceOf[SaveSessionRequest[AnyContent]])
    }
  }

}
