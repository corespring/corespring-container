package org.corespring.shell

import org.corespring.container.client.hooks.PlayerJs
import org.corespring.shell.controllers.player.LoadJs
import org.specs2.mutable.Specification
import play.api.mvc._
import play.api.test.Helpers._
import play.api.test.{ FakeApplication, FakeRequest, WithApplication }

/**
 * LoadJs is a trait defined in ContainerClientImplementation
 * It is defined as a trait to make test setup easier
 */
class LoadJsTest extends Specification with Results with LoadJs {

  import scala.concurrent.ExecutionContext.Implicits.global

  val sut = this

  def noOp(request: PlayerJs): SimpleResult = {
    Ok("noOp").withSession("isSecure" -> request.isSecure.toString)
  }

  def request(url: String = "/test") = {
    FakeRequest(GET, url)
  }

  def appWithSecret = {
    new FakeApplication(additionalConfiguration = Map("application.secret" -> "test"))
  }

  "loadJs" should {

    "pass secure from the query to the session if jsError is set" in new WithApplication(appWithSecret) {
      sut.loadJs(request("/test?secure=true&jsErrors=12,13,14")).map { pjs =>
        pjs.isSecure === true
        pjs.errors === Seq(12, 13, 14)
      }
    }
  }
}
