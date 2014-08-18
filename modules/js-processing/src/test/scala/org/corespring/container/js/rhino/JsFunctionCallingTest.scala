package org.corespring.container.js.rhino

import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import org.mozilla.javascript.{ Function => RhinoFunction, NativeJSON, Context }
import org.mozilla.javascript.tools.shell.Global
import play.api.libs.json.Json

class JsFunctionCallingTest extends Specification with RhinoTestHelper {

  val fn = new JsFunctionCalling {}

  class rhinoContextForFunction(val js: String, val functionName: String) extends Scope {

    lazy val rhinoFn = {
      ctx.evaluateString(rootScope, js, s"test.$functionName", 1, null)
      val fn = rootScope.get(functionName, rootScope).asInstanceOf[RhinoFunction]
      fn
    }

    implicit lazy val rootScope = {
      val global = new Global
      global.init(ctx)
      ctx.initStandardObjects(global)
    }

    implicit lazy val ctx = {
      val ctx = Context.enter
      ctx.setErrorReporter(new LocalErrorReporter)
      ctx.setOptimizationLevel(-1)
      ctx
    }
  }

  "JsFunctionCalling" should {

    val simpleFn =
      """
        |this.simple = function(){
        | return { name: "hello"};
        |}
      """.stripMargin

    "work" in new rhinoContextForFunction(simpleFn, "simple") {
      val out = fn.callJsFunctionJson(js, rhinoFn, rootScope, Array())
      out match {
        case Left(err) => failure(err.message)
        case Right(json) => (json \ "name").asOpt[String] === Some("hello")
      }
    }

    val badFn =
      """
        |this.bad = function(){
        | return { name: name };
        |}
      """.stripMargin

    "fail" in new rhinoContextForFunction(badFn, "bad") {
      fn.callJsFunctionJson(js, rhinoFn, rootScope, Array()) match {
        case Left(err) => err.message === error("ReferenceError: \"name\" is not defined.", "test.bad", 3).message
        case Right(_) => failure("should have failed")
      }

    }

    val fnWithArgs =
      """
        |this.ping = function(msg){
        |  //console.log('msg' + JSON.stringify(msg));
        |  return { msg: msg };
        |}
      """.stripMargin

    "work with args" in new rhinoContextForFunction(fnWithArgs, "ping") {

      val args = Json.obj("a" -> "a")
      fn.callJsFunctionJson(js, rhinoFn, rootScope, Array(args)) match {
        case Left(err) => {
          println(err.message)
          failure
        }
        case Right(json) => {
          println(Json.stringify(json))
          (json \ "msg" \ "a").asOpt[String] === Some("a")
        }
      }
    }

    val booleanJs =
      """
        |this.isOk = function(){ return true };
      """.stripMargin

    "work with Boolean" in new rhinoContextForFunction(booleanJs, "isOk") {

      fn.callJsFunctionBoolean(booleanJs, rhinoFn, rootScope, Array()) match {
        case Left(err) => {
          println(err.message)
          failure(err.message)
        }
        case Right(b) => b === true
      }
    }
  }
}
