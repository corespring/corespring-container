package org.corespring.container.js.rhino

import java.io.{ InputStreamReader, Reader }
import org.corespring.container.js.api.JavascriptError
import org.mozilla.javascript.tools.shell.Global
import org.mozilla.javascript.{ Function => RhinoFunction, _ }
import play.api.libs.json.JsString
import play.api.libs.json.{ Json, JsValue }
import scala.Some
import org.corespring.container.logging.ContainerLogger

trait JsLogging {
  lazy val logger = ContainerLogger.getLogger("js.processing")
}

case class RhinoJsError(
  val message: String,
  val lineNo: Int,
  val column: Int,
  val source: String,
  val name: String) extends JavascriptError

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

trait JsContext extends JsLogging {

  def console: Option[JsConsole] = Some(new DefaultLogger(ContainerLogger.getLogger("js.console")))

  def withJsContext[A](libs: Seq[String], srcs: Seq[(String, String)] = Seq.empty)(f: (Context, Scriptable) => Either[JavascriptError, A]): Either[JavascriptError, A] = {
    val ctx = Context.enter()
    ctx.setErrorReporter(new LocalErrorReporter)
    ctx.setOptimizationLevel(-1)
    val global = new Global
    global.init(ctx)
    val scope = ctx.initStandardObjects(global)

    try {

      def addToContext(libPath: String) = loadJsLib(libPath).map {
        reader =>
          ctx.evaluateReader(scope, reader, libPath, 1, null)
      }

      libs.foreach(addToContext)

      println("------->")
      println(s" srcs -> $srcs")
      def addSrcToContext(name: String, src: String) = {
        println(s"add  $name to context")
        logger.trace(s"add  $name to context")
        ctx.evaluateString(scope, src, name, 1, null)
      }
      srcs.foreach(tuple => addSrcToContext(tuple._1, tuple._2))

      def addToScope(name: String)(thing: Any) = ScriptableObject.putProperty(scope, name, thing)

      console.foreach(addToScope("console"))
      f(ctx, scope)
    } catch {
      case e: RhinoException => Left(RhinoJsError(e))
      case e: Throwable => throw e
    } finally {
      Context.exit()
    }
  }

  private def loadJsLib(path: String): Option[Reader] = {
    val stream = getClass.getResourceAsStream(path)
    if (stream == null) {
      logger.warn(s"Failed to load js from path: $path")
      throw new java.io.IOException(s"Resource not found: $path")
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

  def callJsFunction(rawJs: String, fn: RhinoFunction, parentScope: Scriptable, args: Array[JsValue])(implicit ctx: Context, rootScope: Scriptable): Either[JavascriptError, JsValue] = {
    try {
      val jsArgs: Array[AnyRef] = args.toArray.map(jsObject(_))
      val result = fn.call(ctx, rootScope, parentScope, jsArgs)
      val jsonString: Any = toJsonString.call(ctx, rootScope, rootScope, Array(result))
      val jsonOut = Json.parse(jsonString.toString)
      Right(jsonOut)
    } catch {
      case e: EcmaError => Left(RhinoJsError(e))
      case e: Throwable => throw new RuntimeException("General error while processing js", e)
    }
  }
}
