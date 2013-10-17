package org.corespring.container.js

import play.api.libs.json.{Json, JsValue}
import org.mozilla.javascript.{EcmaError, ScriptableObject, Scriptable, Context}
import org.mozilla.javascript.tools.shell.Global
import java.io.{InputStreamReader, Reader}
import play.api.Logger

trait JsConsole{
  def log(msg : String)
  def warn(msg : String)
  def info(msg : String)
  def debug(msg : String)
}

class DefaultLogger(log:Logger) extends JsConsole{
  def log(msg : String) = log.info(msg)
  def warn(msg : String) = log.warn(msg)
  def info(msg : String) = log.info(msg)
  def debug(msg : String) = log.debug(msg)
}


trait JsContext{

  lazy val logger = Logger("js.processing")

  def console : Option[JsConsole] = Some(new DefaultLogger(Logger("js.console")))

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

    console.foreach{ c =>
      // Add a global variable out that is a JavaScript reflection of the System.out variable:
      val wrappedConsole : Any = Context.javaToJS(c, scope)
      ScriptableObject.putProperty(scope, "console", wrappedConsole)
    }

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
      |console.log("Init mock require function");

      |var require = function(id){
      |  if(id == "lodash" || id == "underscore" ){
      |    if( _ ){
      |       return _;
      |    } else {
      |       console.log("Can't find underscore or lodash");
      |       throw "Can't find underscore/lodash";
      |    }
      |  } else {
      |    console.log("Unsupported library: " + id);
      |    throw "Unsupported library: " + id;
      |  }
      |}
      |
      |var module = {};
      |var exports = {};
      |module.exports = exports;
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
    val jsJson =  scope.get("JSON", scope).asInstanceOf[ScriptableObject]
    val toObject : RhinoFunction = jsJson.get("parse", jsJson).asInstanceOf[RhinoFunction]
    val toJsonString : RhinoFunction = jsJson.get("stringify", jsJson).asInstanceOf[RhinoFunction]

    def jsObject(json:JsValue) : ScriptableObject = {
      val jsonString = Json.stringify(json)
      logger.debug(s"[jsObject] jsonString: $jsonString")
      toObject.call(ctx, scope, scope, Array(jsonString)).asInstanceOf[ScriptableObject]
    }

    if (functionDef.isInstanceOf[RhinoFunction]) {

      try{
        val fn : RhinoFunction = functionDef.asInstanceOf[RhinoFunction]
        val jsArgs : Array[AnyRef] = args.toArray.map(jsObject(_))
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