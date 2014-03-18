package org.corespring.container.js.rhino

import java.io.{ InputStreamReader, Reader }
import org.mozilla.javascript.tools.shell.Global
import org.mozilla.javascript.{ EcmaError, ScriptableObject, Scriptable, Context }
import org.mozilla.javascript.{ Function => RhinoFunction }
import play.api.Logger
import play.api.libs.json.{ JsString, Json, JsValue }

trait JsConsole {
  def log(msg: String)
  def warn(msg: String)
  def info(msg: String)
  def debug(msg: String)
}

class DefaultLogger(log: Logger) extends JsConsole {
  def log(msg: String) = log.info(msg)
  def warn(msg: String) = log.warn(msg)
  def info(msg: String) = log.info(msg)
  def debug(msg: String) = log.debug(msg)
}

trait JsLogging {
  lazy val logger = Logger("js.processing")
}

trait JsContext extends JsLogging {

  def console: Option[JsConsole] = Some(new DefaultLogger(Logger("js.console")))

  def withJsContext(libs: Seq[String], srcs: Seq[String] = Seq.empty)(f: (Context, Scriptable) => JsValue): JsValue = {
    val ctx = Context.enter
    ctx.setOptimizationLevel(-1)
    val global = new Global
    global.init(ctx)
    val scope = ctx.initStandardObjects(global)

    def addToContext(libPath: String) = loadJsLib(libPath).map {
      reader =>
        ctx.evaluateReader(scope, reader, libPath, 1, null)
    }.getOrElse(logger.debug(s"Couldn't load $libPath"))

    libs.foreach(addToContext)

    def addSrcToContext(src: String) = ctx.evaluateString(scope, src, "?", 1, null)
    srcs.foreach(addSrcToContext)

    def addToScope(name: String)(thing: Any) = ScriptableObject.putProperty(scope, name, thing)

    console.foreach(addToScope("console"))

    try {
      f(ctx, scope)
    } catch {
      case e: Exception => throw e;
    } finally {
      Context.exit
    }
  }

  private def loadJsLib(path: String): Option[Reader] = {
    val stream = getClass.getResourceAsStream(path)
    if (stream == null) {
      None
    } else {
      Some(new InputStreamReader((stream)))
    }
  }
}

trait JsFunctionCalling extends JsLogging {

  def jsObject(json: JsValue)(implicit ctx: Context, scope: Scriptable): AnyRef = {
    val jsonString = Json.stringify(json)
    json match {
      case s: JsString => Context.javaToJS(s.value, scope)
      case _ => toObject.call(ctx, scope, scope, Array(jsonString))
    }
  }

  def jsJson(implicit scope: Scriptable) = scope.get("JSON", scope).asInstanceOf[ScriptableObject]

  def toObject(implicit scope: Scriptable): RhinoFunction = jsJson.get("parse", jsJson).asInstanceOf[RhinoFunction]

  def toJsonString(implicit scope: Scriptable): RhinoFunction = jsJson.get("stringify", jsJson).asInstanceOf[RhinoFunction]

  def callJsFunction(rawJs: String, fn: RhinoFunction, parentScope: Scriptable, args: Array[JsValue])(implicit ctx: Context, rootScope: Scriptable): JsValue = {
    try {
      val jsArgs: Array[AnyRef] = args.toArray.map(jsObject(_))
      val result = fn.call(ctx, rootScope, parentScope, jsArgs)
      val jsonString: Any = toJsonString.call(ctx, rootScope, rootScope, Array(result))
      val jsonOut = Json.parse(jsonString.toString)
      jsonOut
    } catch {
      case e: EcmaError => {
        logger.warn("Ecmascript error")
        logger.info(e.getErrorMessage)
        val srcError: String = rawJs.lines.toSeq.zipWithIndex.map {
          zipped: (String, Int) =>
            val (index, line) = zipped
            if (index == e.lineNumber) s"!!!! > $line" else line
        }.mkString("\n")
        logger.warn(srcError)
        logger.debug(s">> line: ${e.lineNumber}, column: ${e.columnNumber} ")
        throw new RuntimeException("Error processing js", e)
      }
      case e: Throwable => throw new RuntimeException("General error while processing js", e)
    }
  }
}
