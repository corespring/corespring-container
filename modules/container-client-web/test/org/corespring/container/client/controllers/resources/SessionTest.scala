package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions._
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import play.api.libs.json.Json
import play.api.mvc.{Request, Action, Result, AnyContent}
import play.api.test.FakeRequest
import play.api.test.Helpers._

class SessionTest extends Specification with Mockito{

  "secure mode" should {

    def saveRequest(isComplete:Boolean) = SaveSessionRequest[AnyContent](
      Json.obj() ,
      true,
      isComplete,
      (a,b) => Some(Json.obj()),
      FakeRequest().withJsonBody(Json.obj())
    )

    def outcomeRequest(isComplete:Boolean) = SessionOutcomeRequest[AnyContent] (
      Json.obj(),
      Json.obj(),
      true,
      isComplete,
      FakeRequest().withJsonBody(Json.obj())
    )

    "allow save when session is not complete" in new ActionBody( saveRequest(false) ) {
      val result = session.saveSession("id")(FakeRequest())
      status(result) === OK
    }

    "not allow save when session is complete" in new ActionBody( saveRequest(true) ) {
      val result = session.saveSession("id")(FakeRequest())
      status(result) === BAD_REQUEST
    }

    "allow load outcome when session is complete" in new ActionBody( outcomeRequest(true) ){
      val result = session.loadOutcome("id")(FakeRequest())
      status(result) === OK
    }

    "not allow load outcome when session is not complete" in new ActionBody( outcomeRequest(false) ){
      val result = session.loadOutcome("id")(FakeRequest())
      status(result) === BAD_REQUEST
    }

  }

  class ActionBody(request: SecureModeRequest[AnyContent]) extends org.specs2.specification.Before{

    val session = new Session{
      def outcomeProcessor: OutcomeProcessor = mock[OutcomeProcessor]

      def scoreProcessor: ScoreProcessor = mock[ScoreProcessor]

      def builder: SessionActionBuilder[AnyContent] = new MockBuilder(request)
    }

    def before = {}
  }

  class MockBuilder(r:Request[AnyContent]) extends SessionActionBuilder[AnyContent] {
    def loadEverything(id: String)(block: (FullSessionRequest[AnyContent]) => Result): Action[AnyContent] = ???

    def load(id: String)(block: (FullSessionRequest[AnyContent]) => Result): Action[AnyContent] = ???

    def loadOutcome(id: String)(block: (SessionOutcomeRequest[AnyContent]) => Result): Action[AnyContent] = Action { request =>
      block(r.asInstanceOf[SessionOutcomeRequest[AnyContent]])
    }

    def submitAnswers(id: String)(block: (SubmitSessionRequest[AnyContent]) => Result): Action[AnyContent] = ???

    def save(id: String)(block: (SaveSessionRequest[AnyContent]) => Result): Action[AnyContent] = Action{ request =>
      block(r.asInstanceOf[SaveSessionRequest[AnyContent]])
    }
  }

}
