package org.corespring.container.js.rhino

import org.specs2.mutable.Specification
import org.mozilla.javascript.{ Scriptable, Context }
import org.specs2.specification.Before

trait RhinoTestHelper {
  def error(msg: String, file: String, line: Int) = RhinoJsError(s"$msg ($file#$line)", line, 0, null, file)
}

class JsContextTest extends Specification with RhinoTestHelper {

  val client = new NewJsContext {}

  val defaultJs =
    """
      |"hello"
    """.stripMargin

  val badRefJs = """
    |var x = "x";
    |callUndefinedFunction();
  """.stripMargin

  def fullPath(n: String) = {
    val p = this.getClass.getPackage.getName.replace(".", "/")
    println(s" path: $p")
    s"/$p/$n"
  }

  "JsContext" should {

    class contextScope(js: String = defaultJs, val name: String = "ok.js", libs: Seq[String] = Seq.empty, srcs: Seq[(String, String)] = Seq.empty) extends Before {

      val libsWithPath = libs.map(fullPath(_))

      val out = client.withJsContext[String](libsWithPath, srcs) {
        (ctx: Context, scope: Scriptable) =>
          val o = ctx.evaluateString(scope, js, name, 1, null)
          Right(o.asInstanceOf[String])
      }

      override def before: Any = {}
    }

    "throw an error on bad syntax" in new contextScope("bad js", "bad_js.js") {
      out === Left(error("Compilation produced 1 syntax errors.", name, 1))
    }

    "throw an error on undefined reference" in new contextScope(
      badRefJs,
      "ref_error.js") {

      out === Left(error("ReferenceError: \"callUndefinedFunction\" is not defined.", name, 3))
    }

    "throw an error on bad js in a lib" in new contextScope(
      libs = Seq("bad_lib.js")) {
      val path = fullPath("bad_lib.js")
      out === Left(error("ReferenceError: \"libCallUndefinedFunction\" is not defined.", path, 1))
    }

    "throw an error on bad js in srcs" in new contextScope(
      srcs = Seq(("bad-src.js" -> badRefJs))) {
      out === Left(error("ReferenceError: \"callUndefinedFunction\" is not defined.", "bad-src.js", 3))
    }
  }
}
