package org.corespring.container.js.rhino

import java.io.{ InputStreamReader, Reader }
import org.mozilla.javascript.tools.shell.Global
import org.mozilla.javascript.{ Function => RhinoFunction, _ }
import play.api.Logger
import play.api.libs.json.{ JsString, Json, JsValue }
import org.corespring.container.js.api.JsError
import play.api.libs.json.JsString
import scala.Some

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

case class RhinoJsError(
  val message: String,
  val lineNo: Int,
  val column: Int,
  val source: String,
  val name: String) extends JsError

object RhinoJsError {
  def apply(e: RhinoException): RhinoJsError = {
    RhinoJsError(e.getMessage, e.lineNumber(), e.columnNumber, e.lineSource, e.sourceName)
  }
}

class LocalErrorReporter extends ErrorReporter {
  override def runtimeError(message: String, sourceName: String, line: Int, lineSource: String, lineOffset: Int): EvaluatorException = {
    println(s"[LocalErrorReporter:runtimeError] -> $message")
    new EvaluatorException(message, sourceName, line, lineSource, lineOffset)
  }

  override def error(message: String, sourceName: String, line: Int, lineSource: String, lineOffset: Int): Unit = {
    println(s"[LocalErrorReporter:error] -> $message")
  }

  override def warning(message: String, sourceName: String, line: Int, lineSource: String, lineOffset: Int): Unit = {
    println(s"[LocalErrorReporter:warning] -> $message")
  }

}

trait NewJsContext extends JsLogging {

  def console: Option[JsConsole] = Some(new DefaultLogger(Logger("js.console")))

  def withJsContext[A](libs: Seq[String], srcs: Seq[String] = Seq.empty)(f: (Context, Scriptable) => Either[JsError, A]): Either[JsError, A] = {
    val ctx = Context.enter
    ctx.setErrorReporter(new LocalErrorReporter)
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
      case e: RhinoException => {
        println("... js error..")
        Left(RhinoJsError(e))
      }
      case e: Throwable => {
        println("... js error..")
        throw e
      }
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

trait JsContext extends JsLogging {

  def console: Option[JsConsole] = Some(new DefaultLogger(Logger("js.console")))

  def withJsContext[A](libs: Seq[String], srcs: Seq[String] = Seq.empty)(f: (Context, Scriptable) => A): A = {
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
      case e: Exception => {
        println("... js error..")
        throw e
      }
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
