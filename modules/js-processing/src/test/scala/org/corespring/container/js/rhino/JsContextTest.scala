package org.corespring.container.js.rhino

import org.specs2.mutable.Specification
import org.mozilla.javascript.{ Scriptable, Context }

class JsContextTest extends Specification {

  val client = new NewJsContext {}

  "JsContext" should {
    "throw an error" in {

      val out = client.withJsContext[String](Seq.empty, Seq.empty) { (ctx: Context, scriptable: Scriptable) =>
        Right("hello")
      }
      out === Right("hello")
    }
  }
}
