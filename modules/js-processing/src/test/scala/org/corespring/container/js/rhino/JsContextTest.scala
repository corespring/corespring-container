package org.corespring.container.js.rhino

import org.specs2.mutable.Specification
import org.mozilla.javascript.{ Scriptable, Context }

class JsContextTest extends Specification {

  val client = new NewJsContext {}

  "JsContext" should {
    "throw a compilation error" in {

      val out = client.withJsContext[String](Seq.empty, Seq.empty) { (ctx: Context, scope: Scriptable) =>
        val o = ctx.evaluateString(scope, "bad javascript", "throw_error.js", 1, null)
        Right(o.asInstanceOf[String])
      }
      out === Left(RhinoJsError("Compilation produced 1 syntax errors. (throw_error.js#1)", 1, 0, null, "throw_error.js"))
    }

    "throw a evaluation error" in {

      val js =
        """
          |callUndefinedFunction();
        """.stripMargin
      val out = client.withJsContext[String](Seq.empty, Seq.empty) { (ctx: Context, scope: Scriptable) =>
        val o = ctx.evaluateString(scope, js, "throw_error.js", 1, null)
        Right(o.asInstanceOf[String])
      }
      out === Left(RhinoJsError("Compilation produced 1 syntax errors. (throw_error.js#1)", 1, 0, null, "throw_error.js"))
    }
  }
}
