package org.corespring.container.js.rhino

import java.io.{ InputStreamReader, Reader }
import org.corespring.container.js.api.JavascriptError
import org.mozilla.javascript.tools.shell.Global
import org.mozilla.javascript.{ Function => RhinoFunction, _ }
import play.api.libs.json.JsString
import play.api.libs.json.{ Json, JsValue }
import scala.Some
import org.corespring.container.logging.ContainerLogger

import scala.collection.mutable

trait JsLogging {
  lazy val logger = ContainerLogger.getLogger("JsProcessing")
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
object Scopes {
  lazy val logger = ContainerLogger.getLogger("Scopes")
  private val scopes : mutable.Map[Int,Scriptable] = mutable.Map()

  def get(uid:Int) : Option[Scriptable] = {
    val out = scopes.get(uid)
    logger.trace(s"get $uid: $out")
    out
  }

  def put(uid:Int, s:Scriptable) : Unit = {
    logger.trace(s"set: $uid: $s")
    scopes.put(uid, s)
  }
}

trait GlobalScope {

  def console: Option[JsConsole] = Some(new DefaultLogger(ContainerLogger.getLogger("JsConsole")))

  lazy val logger = ContainerLogger.getLogger("Scopes")

  private def loadJsLib(path: String): Option[Reader] = {
    val stream = getClass.getResourceAsStream(path)
    if (stream == null) {
      logger.warn(s"Failed to load js from path: $path")
      throw new java.io.IOException(s"Resource not found: $path")
    } else {
      Some(new InputStreamReader((stream)))
    }
  }

  def files : Seq[String]
  def srcs : Seq[(String, String)]

  lazy val globalScriptable : Option[Scriptable] = {

    try {
      val context = Context.enter()
      logger.info(s"Building a global reusble scope ${srcs.map(_._1).mkString("-")}")
      logger.trace(s"reusble scope files: ${files.mkString("\n")}")
      logger.trace(s"reusble scope srcs: ${srcs.map(_._1).mkString("\n")}")
      val global = new Global
      global.init(context)
      val scope = context.initStandardObjects(global)
      console.foreach(addToScope("console"))

      def addToContext(libPath: String) = loadJsLib(libPath).map {
        reader =>
          logger.debug(s"[addToContext] $libPath")
          context.evaluateReader(scope, reader, libPath, 1, null)
      }

       files.foreach(addToContext)

      def addSrcToContext(name: String, src: String) = {
        logger.trace(s"add  $name to context")
        println(s"add  $name to context")
        println(s"add  $src")
        context.evaluateString(scope, src, name, 1, null)
      }
      srcs.foreach(tuple => addSrcToContext(tuple._1, tuple._2))

      def addToScope(name: String)(thing: Any) = ScriptableObject.putProperty(scope, name, thing)

      Some(scope)

    } catch {
      case e : Throwable => {
        logger.error(e.getMessage)
        None
      }
    } finally {
      Context.exit()
    }
  }

}

trait JsContext extends JsLogging {

  def console: Option[JsConsole] = Some(new DefaultLogger(ContainerLogger.getLogger("JsConsole")))

  private def loadScope(context: Context, libs:Seq[String], srcs : Seq[(String, String)]) : ScriptableObject = {

    val uid = s"${libs.mkString(",")}-${srcs.map(_._1).mkString(",")}}".hashCode
    val s : Scriptable = Scopes.get(uid).getOrElse{

        logger.debug(s"Need to build a new scope for ${srcs.map(_._1).mkString("-")}")
        val global = new Global
        global.init(context)
        val scope = context.initStandardObjects(global)

        def addToContext(libPath: String) = loadJsLib(libPath).map {
          reader =>
            context.evaluateReader(scope, reader, libPath, 1, null)
        }

        libs.foreach(addToContext)

        def addSrcToContext(name: String, src: String) = {
          logger.trace(s"add  $name to context")
          context.evaluateString(scope, src, name, 1, null)
        }
        srcs.foreach(tuple => addSrcToContext(tuple._1, tuple._2))

        def addToScope(name: String)(thing: Any) = ScriptableObject.putProperty(scope, name, thing)

        console.foreach(addToScope("console"))
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
