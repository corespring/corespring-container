package org.corespring.container.components.response

import org.mozilla.javascript.tools.shell.Global
import org.mozilla.javascript.{NativeJavaObject, ScriptableObject, Scriptable, Context}
import play.api.libs.json.{Json, JsObject, JsValue}
import org.slf4j.LoggerFactory
import java.io.{InputStreamReader, Reader}
import java.net.URL

class ResponseGenerator(definition: String, question: JsValue, answer: JsValue, settings: JsValue) {

  private val logger = LoggerFactory.getLogger("components.response")

  def wrapper(definition:String) =
    s"""
      |var require = function(id){
      |  if(id == "lodash" || id == "underscore" ){
      |    if( _ ){
      |       return _;
      |    } else {
      |       systemOut.println("Can't find underscore or lodash");
      |       throw "Can't find underscore/lodash";
      |    }
      |  } else {
      |    systemOut.println("Unsupported library: " + id);
      |    throw "Unsupported library: " + id;
      |  }
      |}
      |
      |var module = {};
      |var exports = {};
      |module.exports = exports;
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
      logger.debug(s"[jsObject] jsonString: $jsonString")
      toObject.call(ctx, scope, scope, Array(jsonString)).asInstanceOf[ScriptableObject]
    }

    if (respond.isInstanceOf[RhinoFunction]) {
      val fn : RhinoFunction = respond.asInstanceOf[RhinoFunction]
      val args : Array[AnyRef] = Array(jsObject(question), jsObject(answer), jsObject(settings))
      val result = fn.call(ctx, scope, exports, args)
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

    loadJsLib("/js-libs/lodash.min.js").map{ reader =>
      ctx.evaluateReader(scope, reader, "lodash.min.js", 1, null)
    }.getOrElse(logger.debug("Couldn't load lodash"))

    // Add a global variable out that is a JavaScript reflection of the System.out variable:
    val wrappedOut: Any = Context.javaToJS(System.out, scope)
    ScriptableObject.putProperty(scope, "systemOut", wrappedOut)

    try {
      f(ctx, scope)
    } catch {
      case e: Exception => throw e;
    } finally {
      Context.exit
    }
  }

  private def loadJsLib(path:String) : Option[Reader] = {
    logger.debug(s"loadJsLib: $path")
    val stream  = getClass.getResourceAsStream(path)
    if(stream == null){
      None
    } else {
      logger.debug(stream.toString)
      Some(new InputStreamReader((stream)))
    }
  }
}
