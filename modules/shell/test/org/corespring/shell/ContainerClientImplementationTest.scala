package org.corespring.shell

import play.api.mvc._
import org.corespring.container.client.actions.PlayerJsRequest
import play.api.test.{ FakeRequest, WithApplication, FakeApplication }
import org.specs2.mutable.Specification
import play.api.test.Helpers._
import scala.concurrent.{ ExecutionContext, Future }

class ContainerClientImplementationTest extends Specification with Results {

  import ExecutionContext.Implicits.global

  val sut = ContainerClientImplementation

  def noOp(request: PlayerJsRequest[AnyContent]): SimpleResult = {
    Ok("noOp").withSession("isSecure" -> request.isSecure.toString)
  }

  def request(url: String = "/test") = {
    FakeRequest(GET, url)
  }

  def appWithSecret = {
    new FakeApplication(additionalConfiguration = Map("application.secret" -> "test"))
  }

  "noOp" should {
    "pass isSecure through as true" in new WithApplication(appWithSecret) {
      val result = noOp(PlayerJsRequest[AnyContent](true, request()))
      session(Future(result)).get("isSecure") === Some("true")
    }
    "pass isSecure through as false" in new WithApplication(appWithSecret) {
      val result = noOp(PlayerJsRequest[AnyContent](false, request()))
      session(Future(result)).get("isSecure") === Some("false")
    }
  }

  "loadJs" should {
    "pass secure from the query to the session" in new WithApplication(appWithSecret) {
      val response = sut.loadJs(noOp)(request("/test?secure=true"))
      session(response).get("isSecure") === Some("true")
    }
    "pass secure from the query to the session if jsError is set" in new WithApplication(appWithSecret) {
      val response = sut.loadJs(noOp)(request("/test?secure=true&jsErrors=12,13,14"))
      session(response).get("isSecure") === Some("true")
    }
    "pass secure from the query to the session if pageErrors is set" in new WithApplication(appWithSecret) {
      val response = sut.loadJs(noOp)(request("/test?secure=true&pageErrors=15,16,17"))
      session(response).get("isSecure") === Some("true")
    }
  }

}
