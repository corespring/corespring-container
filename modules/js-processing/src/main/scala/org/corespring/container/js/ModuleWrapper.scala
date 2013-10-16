package org.corespring.container.js

import play.api.libs.json.{Json, JsValue}
import org.mozilla.javascript.{EcmaError, ScriptableObject, Scriptable, Context}
import org.mozilla.javascript.tools.shell.Global
import java.io.{InputStreamReader, Reader}
import play.api.Logger

trait JsContext{

  lazy val logger = Logger("js.processing")

  def withJsContext( libs : Seq[String] )( f: (Context, Scriptable) => JsValue ): JsValue = {
    val ctx = Context.enter
    ctx.setOptimizationLevel(-1)
    val global = new Global
    global.init(ctx)
    val scope = ctx.initStandardObjects(global)

    (libs :+ "/js-libs/lodash.min.js").foreach{ l =>
      loadJsLib(l).map{ reader =>
        ctx.evaluateReader(scope, reader, l, 1, null)
      }.getOrElse(logger.debug(s"Couldn't load $l"))
    }

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
    val stream  = getClass.getResourceAsStream(path)
    if(stream == null){
      None
    } else {
      Some(new InputStreamReader((stream)))
    }
  }
}

trait ModuleWrapper{

  def js : String

  def run(functionName:String, args: JsValue*) : JsValue
}

/** A wrapper for the commonJs module pattern */
trait ModuleWrapperImpl extends ModuleWrapper with JsContext{

  private def wrap(d:String) =
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
      |$d
      |
    """.stripMargin


  override def run(functionName:String, args:JsValue*) : JsValue = withJsContext(Seq.empty) { (ctx:Context, scope:Scriptable) =>

    import org.mozilla.javascript.{Function => RhinoFunction}

    val wrappedJs = wrap(js)
    ctx.evaluateString(scope, wrappedJs, "<cmd>", 1, null)

    val exports : Scriptable = scope.get("exports", scope).asInstanceOf[Scriptable]
    val functionDef : Any = exports.get(functionName, exports)
    val toObject : RhinoFunction = exports.get("__internal__toObject", exports).asInstanceOf[RhinoFunction]
    val toJsonString : RhinoFunction = exports.get("__internal__toJsonString", exports).asInstanceOf[RhinoFunction]

    def jsObject(json:JsValue) : ScriptableObject = {
      val jsonString = Json.stringify(json)
      logger.debug(s"[jsObject] jsonString: $jsonString")
      toObject.call(ctx, scope, scope, Array(jsonString)).asInstanceOf[ScriptableObject]
    }

    if (functionDef.isInstanceOf[RhinoFunction]) {

      try{
        val fn : RhinoFunction = functionDef.asInstanceOf[RhinoFunction]
        val jsArgs : Array[AnyRef] = args.toArray.map(jsObject(_)) //Array(jsObject(question), jsObject(answer), jsObject(settings))
        val result = fn.call(ctx, scope, exports, jsArgs)
        logger.debug(s"result: ${result.toString}")
        val jsonString : Any = toJsonString.call(ctx, scope, scope, Array(result))
        logger.debug(s" json string : ${jsonString.toString}")
        val jsonOut = Json.parse(jsonString.toString)
        jsonOut
      } catch {
        case e: EcmaError => {
          logger.warn("Ecmascript error")
          logger.info(e.getErrorMessage)
          val srcError : String = js.lines.toSeq.zipWithIndex.map{ zipped : (String,Int) =>
            val (index, line) = zipped
            if(index == e.lineNumber) s"!!!! > $line" else line
          }.mkString("\n")
          logger.warn(srcError)
          logger.debug( s">> line: ${e.lineNumber}, column: ${e.columnNumber} " )
          throw new RuntimeException("Error processing js", e)
        }
        case e : Throwable => throw new RuntimeException("Error processing js", e)
      }
    } else {
      throw new RuntimeException(s"$functionName is not defined as a function in \n $js")
    }
  }
}