package org.corespring.container.js.rhino

import java.io.{ InputStreamReader, Reader }
import grizzled.slf4j.Logger
import org.corespring.container.js.api.JavascriptError
import org.mozilla.javascript.tools.shell.Global
import org.mozilla.javascript.{ Function => RhinoFunction, _ }
import play.api.libs.json.JsString
import play.api.libs.json.{ Json, JsValue }
import org.corespring.container.logging.ContainerLogger

import scala.collection.mutable

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

private[rhino] object Scopes {
  lazy val logger = ContainerLogger.getLogger("Scopes")
  private val scopes: mutable.Map[Int, Scriptable] = mutable.Map()

  def get(uid: Int): Option[Scriptable] = {
    val out = scopes.get(uid)
    logger.trace(s"get $uid: $out")
    out
  }

  def put(uid: Int, s: Scriptable): Unit = {
    logger.trace(s"set: $uid: $s")
    scopes.put(uid, s)
  }
}

trait LibLoading {

  private lazy val logger: Logger = Logger(classOf[LibLoading])

  def loadJsLib(path: String): Option[Reader] = {
    val stream = getClass.getResourceAsStream(path)
    if (stream == null) {
      throw new java.io.IOException(s"Resource not found: $path")
    } else {
      Some(new InputStreamReader((stream)))
    }
  }

  def addToContext(context: Context, scope: Scriptable, libPath: String) = loadJsLib(libPath).map {
    reader =>
      logger.trace(s"[addToContext] $libPath")
      context.evaluateReader(scope, reader, libPath, 1, null)
      reader.close()
  }

  def addSrcToContext(context: Context, scope: Scriptable, name: String, src: String) = {
    logger.trace(s"add  $name to context")
    context.evaluateString(scope, src, name, 1, null)
  }

  def addToScope(scope: Scriptable, name: String)(thing: Any) = ScriptableObject.putProperty(scope, name, thing)

  def console: Option[JsConsole] = Some(new DefaultLogger(ContainerLogger.getLogger("JsConsole")))
}

/**
 * Lazily initializes a single `Scriptable` for the instance, with the files and srcs added to the scope.
 */
trait GlobalScope extends LibLoading {

  private lazy val logger = Logger(classOf[GlobalScope])

  def files: Seq[String]

  def srcs: Seq[(String, String)]

  lazy val globalScriptable: Option[Scriptable] = {

    try {
      val context = Context.enter()
      logger.trace(s"reusable scope files: ${files.mkString("\n")}")
      logger.trace(s"reusable scope srcs: ${srcs.map(_._1).mkString("\n")}")
      val global = new Global
      global.init(context)
      val scope = context.initStandardObjects(global)
      console.foreach(addToScope(scope, "console"))
      files.foreach(addToContext(context, scope, _))
      srcs.foreach(tuple => addSrcToContext(context, scope, tuple._1, tuple._2))
      Some(scope)
    } catch {
      case e: Throwable => {
        logger.error(e.getMessage)
        None
      }
    } finally {
      Context.exit()
    }
  }
}

trait JsContext extends LibLoading {

  private lazy val logger = Logger(classOf[JsContext])

  private def loadScope(context: Context, libs: Seq[String], srcs: Seq[(String, String)]): ScriptableObject = {

    val uid = s"${libs.mkString(",")}-${srcs.map(_._1).mkString(",")}}".hashCode
    val s: Scriptable = Scopes.get(uid).getOrElse {
      logger.debug(s"Need to build a new scope for srcs: ${srcs.map(_._1).mkString("\n")}")
      logger.debug(s"Need to build a new scope for libs: ${libs.mkString("\n")}")
      val global = new Global
      global.init(context)
      val scope = context.initStandardObjects(global)
      console.foreach(addToScope(scope, "console"))
      libs.foreach(addToContext(context, scope, _))
      srcs.foreach(tuple => addSrcToContext(context, scope, tuple._1, tuple._2))
      Scopes.put(uid, scope)
      scope
    }
    s.asInstanceOf[ScriptableObject]
  }

  def withJsContext[A](libs: Seq[String], srcs: Seq[(String, String)] = Seq.empty)(f: (Context, Scriptable) => Either[JavascriptError, A]): Either[JavascriptError, A] = {
    val ctx = Context.enter()
    ctx.setErrorReporter(new LocalErrorReporter)
    ctx.setOptimizationLevel(-1)
    try {
      val scope = loadScope(ctx, libs, srcs)
      f(ctx, scope)
    } catch {
      case e: RhinoException => Left(RhinoJsError(e))
      case e: Throwable => throw e
    } finally {
      Context.exit()
    }
  }
}

trait JsFunctionCalling {

  def jsObject(json: JsValue)(implicit ctx: Context, scope: Scriptable): AnyRef = {
    val jsonString = Json.stringify(json)
    json match {
      case s: JsString => Context.javaToJS(s.value, scope)
      case _ => toObject.call(ctx, scope, scope, Array(jsonString))
    }
  }

  def jsJson(implicit scope: Scriptable) = scope.get("JSON", scope).asInstanceOf[ScriptableObject]

  def toObject(implicit scope: Scriptable): RhinoFunction = jsJson.get("parse", jsJson).asInstanceOf[RhinoFunction]

  def toJsonString(implicit scope: Scriptable): RhinoFunction = {
    jsJson.get("stringify",
      jsJson).asInstanceOf[RhinoFunction]
  }

  def callJsFunctionJson(
    rawJs: String,
    fn: RhinoFunction,
    parentScope: Scriptable,
    args: Array[JsValue])(implicit ctx: Context, rootScope: Scriptable): Either[JavascriptError, JsValue] = {
    def mkJson(o: Any): JsValue = {
      val jsonString: String = NativeJSON.stringify(ctx, rootScope, o, null, null).asInstanceOf[String]
      Json.parse(jsonString.toString)
    }
    callJsFunction(rawJs, fn, parentScope, args, mkJson)(ctx, rootScope)
  }

  def callJsFunctionBoolean(
    rawJs: String,
    fn: RhinoFunction,
    parentScope: Scriptable,
    args: Array[JsValue])(implicit ctx: Context, rootScope: Scriptable): Either[JavascriptError, Boolean] = {
    def mkBoolean(o: Any): Boolean = {
      Context.jsToJava(o, classOf[java.lang.Boolean]).asInstanceOf[Boolean]
    }
    callJsFunction(rawJs, fn, parentScope, args, mkBoolean)(ctx, rootScope)
  }

  def callJsFunction[A](
    rawJs: String,
    fn: RhinoFunction,
    parentScope: Scriptable,
    args: Array[JsValue],
    makeResult: Any => A)(implicit ctx: Context, rootScope: Scriptable): Either[JavascriptError, A] = {
    try {
      val jsArgs: Array[AnyRef] = args.toArray.map(jsObject(_))
      val result = fn.call(ctx, rootScope, parentScope, jsArgs)
      Right(makeResult(result))
    } catch {
      case e: EcmaError => Left(RhinoJsError(e))
      case e: Throwable => throw new RuntimeException("General error while processing js", e)
    }
  }
}
