package org.corespring.container.client.controllers

import org.specs2.mutable.Specification
import play.api.mvc.AnyContentAsEmpty
import play.api.test.Helpers._
import play.api.test.{FakeHeaders, FakeRequest}

class FileControllerTest extends Specification {

  val rootPath = s"modules/container-client-web/test/${this.getClass.getName.replaceAll("\\.", "/")}"

  "file controller" should {

    "return assets" in {

      val controller = new FileController {
        def componentsPath: String = s"$rootPath/one"
        def defaultCharSet : String = "utf-8"
      }
      val result = controller.at("org", "component", "hello.txt")(FakeRequest("", "", FakeHeaders(), AnyContentAsEmpty))
      status(result) === OK
      contentAsString(result) === "hello"
    }
  }

}
