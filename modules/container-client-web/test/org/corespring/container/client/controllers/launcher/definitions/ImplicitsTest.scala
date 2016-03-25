package org.corespring.container.client.controllers.launcher.definitions

import org.specs2.mutable.Specification
import play.api.libs.json.Json
import play.api.mvc.Call

class ImplicitsTest extends Specification {

  "callToJsv" should {
    "return json object with method and url" in {
      import Implicits._
      Json.obj("a" -> Call("GET", "url")) must_== Json.obj("a" -> Json.obj("method" -> "GET", "url" -> "url"))
    }
  }
}
