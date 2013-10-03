package org.corespring.container.components.response

import org.mozilla.javascript.tools.shell.Global
import org.mozilla.javascript.{NativeJavaObject, ScriptableObject, Scriptable, Context}
import play.api.libs.json.{Json, JsObject, JsValue}
import org.slf4j.LoggerFactory

class ResponseGenerator(definition: String, question: JsValue, answer: JsValue, settings: JsValue) {

  private val logger = LoggerFactory.getLogger("components.response")

  def wrapper(definition:String) =
    s"""
      |var exports = {};
      |
      |exports.__internal__toObject = function(jsonString){ return JSON.parse(jsonString); };
      |exports.__internal__toJsonString = function(obj){ return JSON.stringify(obj); };
      |
      |$definition
    """.stripMargin

  /**
   * TODO: we are serializing/deserializing json objects here - this will do for the Poc,
   * but may not be the best way - need to research options.
   * @return
   */
  def response: JsValue = withJsContext{ (ctx:Context, scope: Scriptable) =>

    import org.mozilla.javascript.{Function => RhinoFunction}

    val js = wrapper(definition)
    ctx.evaluateString(scope, js, "<cmd>", 1, null)

    val exports : Scriptable = scope.get("exports", scope).asInstanceOf[Scriptable]

    val respond : Any = exports.get("respond", exports)

    val toObject : RhinoFunction = exports.get("__internal__toObject", exports).asInstanceOf[RhinoFunction]
    val toJsonString : RhinoFunction = exports.get("__internal__toJsonString", exports).asInstanceOf[RhinoFunction]

    def jsObject(json:JsValue) : ScriptableObject = {

      val jsonString = Json.stringify(json)
      toObject.call(ctx, scope, scope, Array(jsonString)).asInstanceOf[ScriptableObject]
    }

    if (respond.isInstanceOf[RhinoFunction]) {
      val fn : RhinoFunction = respond.asInstanceOf[RhinoFunction]
      val args : Array[AnyRef] = Array(jsObject(question), jsObject(answer), jsObject(settings))
      val result = fn.call(ctx, scope, scope, args)
      logger.debug(s"result: ${result.toString}")
      val jsonString : Any = toJsonString.call(ctx, scope, scope, Array(result))
      logger.debug(s" json string : ${jsonString.toString}")
      val jsonOut = Json.parse(jsonString.toString)
      jsonOut
    } else {
      throw new RuntimeException("??")
    }
  }

  def withJsContext(f: (Context, Scriptable) => JsValue ): JsValue = {
    val ctx = Context.enter
    ctx.setOptimizationLevel(-1)
    val global = new Global
    global.init(ctx)
    val scope = ctx.initStandardObjects(global)

    try {
      f(ctx, scope)
    } catch {
      case e: Exception => throw e;
    } finally {
      Context.exit
    }
  }
}
