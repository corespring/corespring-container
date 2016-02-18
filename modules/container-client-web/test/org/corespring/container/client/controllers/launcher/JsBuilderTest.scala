package org.corespring.container.client.controllers.launcher

import org.corespring.container.client.views.txt.js.ServerLibraryWrapper
import org.specs2.mutable.Specification
import org.specs2.specification.{ Fragments, Scope }
import play.api.libs.json.Json

class JsBuilderTest extends Specification {

  trait scope extends Scope {
    def load(s: String) = Some(s"//$s")
    val builder = new JsBuilder(load)
    def path(s: String) = s"//container-client/js/player-launcher/$s.js"
    val jsString = builder.buildJs("url", Seq("file.js"), Json.obj("opts" -> "opts"), "bootstrap", Map("a" -> "apple"))
  }

  "buildJs" should {

    def assert(key: String, testPath: Option[String] = None): Fragments = {
      s"add $key" in new scope {
        val actualPath = testPath.getOrElse(path(key))
        val jsLib = ServerLibraryWrapper(key, actualPath).toString
        jsString.contains(jsLib) must_== true
      }
    }

    assert("logger")
    assert("callback-utils")
    assert("error-codes")
    assert("instance")
    assert("client-launcher")
    assert("url-builder")
    assert("object-id")
    assert("draft-id")

    "contains bootstrap" in new scope {
      jsString.contains("bootstrap")
    }
  }
}
