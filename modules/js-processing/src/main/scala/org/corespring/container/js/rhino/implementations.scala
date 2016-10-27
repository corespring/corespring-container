package org.corespring.container.js.rhino

import org.corespring.container.components.model.{Component, Interaction, Library, LibrarySource}
import org.corespring.container.components.services.DependencyResolver
import org.corespring.container.js.api.{JavascriptProcessingException, ComponentServerLogic => ApiComponentServerLogic, CustomScoringJs => ApiCustomScoring}
import org.corespring.container.js.processing.PlayerItemPreProcessor
import org.corespring.container.js.response.OutcomeProcessor
import org.mozilla.javascript.{Context, NativeObject, Scriptable, Undefined, UniqueTag, Function => RhinoFunction}
import play.api.Logger
import play.api.libs.json.{JsObject, JsValue, Json}
import org.corespring.container.logging.ContainerLogger

trait CoreLibs {

  protected val rootJs = Seq(
    "/container-client/js/corespring/core-library.js",
    "/container-client/js/corespring/core.js")

  protected val libs = Seq(
    "/js-libs/lodash.min.js",
    "/js-libs/sax.js",
    "/js-libs/math.min.js") ++ rootJs :+
    "/container-client/js/corespring/server/init-core-library.js"
}

trait CorespringJs extends CoreLibs {

  def js: String

  def exports: String

  def wrapped = s"""
    (function(exports, require){
      $js
    })($exports, corespring.require);
  """
}

trait CustomScoringJs
  extends ApiCustomScoring
  with JsContext
  with JsFunctionCalling
  with CorespringJs {

  override def exports = "corespring.server.customScoring()"

  private def getScoringObject(ctx: Context, scope: Scriptable): Scriptable = {
    val corespring = scope.get("corespring", scope).asInstanceOf[Scriptable]
    val server = corespring.get("server", corespring).asInstanceOf[Scriptable]
    val overrideFn = server.get("customScoring", server).asInstanceOf[RhinoFunction]
    val obj = overrideFn.call(ctx, scope, server, Array())
    obj.asInstanceOf[Scriptable]
  }

  def process(item: JsValue, answers: JsValue, computedOutcomes: JsValue): JsValue = {
    val result = withJsContext[JsValue](libs) {
      (ctx: Context, scope: Scriptable) =>
        implicit val rootScope = scope
        implicit val rootContext = ctx
        ctx.evaluateString(scope, wrapped, s"customScoring.process", 1, null)
        val scoringObject = getScoringObject(ctx, scope)
        val processFn = scoringObject.get("process", scoringObject).asInstanceOf[RhinoFunction]
        callJsFunctionJson(wrapped, processFn, scoringObject, Array(item, answers, computedOutcomes))
    }

    result match {
      case Left(err) => throw JavascriptProcessingException(err)
      case Right(json) => json
    }
  }
}

class RhinoServerLogic(componentType: String, scope: Scriptable)
  extends ApiComponentServerLogic
  with JsFunctionCalling {

  private lazy val logger = Logger(classOf[RhinoServerLogic])

  private def serverLogic(ctx: Context, scope: Scriptable): Scriptable = {
    val corespring = scope.get("corespring", scope).asInstanceOf[Scriptable]
    val server = corespring.get("server", corespring).asInstanceOf[Scriptable]
    val logic = server.get("logic", server).asInstanceOf[RhinoFunction]
    val serverLogic = logic.call(ctx, scope, logic, Array(Context.javaToJS(componentType, scope)))

    try {
      val keys = serverLogic.asInstanceOf[NativeObject].keySet().toArray

      if (keys.length == 0) {
        logger.error(s"Server logic for $componentType contains no methods")
      }
    } catch {
      case t : Throwable => logger.error(s"failed to read ServerLogic keys from $componentType")
    }

    serverLogic.asInstanceOf[Scriptable]
  }

  override def createOutcome(question: JsValue, response: JsValue, settings: JsValue, targetOutcome: JsValue): JsValue = {

    try {
      val context = Context.enter()
      val server = serverLogic(context, scope)
      def execute(fn: RhinoFunction) = {
        val result = callJsFunctionJson("", fn, server, Array(question, response, settings, targetOutcome))(context, scope)
        result match {
          case Left(err) => {
            logger.error(s"function=createOutcome, \nmsg=${err.message} lineno=${err.lineNo}, \nsource=${err.source}")
            throw new JavascriptProcessingException(err)
          }
          case Right(json) => json.asInstanceOf[JsObject] ++ Json.obj("studentResponse" -> response)
        }
      }

      server.get("createOutcome", server) match {
        case fn: RhinoFunction => execute(fn)
        case ut: UniqueTag => throw new RuntimeException(s"$componentType : Error can't find function createOutcome")
      }
    } catch {
      case e: Throwable => {
        logger.error(e.getMessage)
        throw e
      }
    } finally {
      Context.exit()
    }
  }

  override def preProcessItem(question: JsValue): JsValue = try {
    val context = Context.enter()
    val server = serverLogic(context, scope)
    server.get("preprocess", server) match {
      case ut: UniqueTag => question
      case fn: RhinoFunction => {
        val result = callJsFunctionJson("", fn, server, Array(question))(context, scope)
        result match {
          case Left(err) => throw JavascriptProcessingException(err)
          case Right(json) => json
        }
      }
    }
  } catch {
    case e: Throwable => {
      throw new RuntimeException("[preProcessItem] error:", e)
    }
  } finally {
    Context.exit()
  }

  /**
   * Is this component scoreable?
   *
   * @param question
   * @param response
   * @param outcome
   * @return
   */
  override def isScoreable(question: JsValue, response: JsValue, outcome: JsValue): Boolean = try {
    val context = Context.enter()
    val server = serverLogic(context, scope)
    server.get("isScoreable", server) match {
      case ut: UniqueTag => true
      case fn: RhinoFunction => {
        val result = callJsFunctionBoolean("", fn, server, Array(question, response, outcome))(context, scope)
        result match {
          case Left(err) => throw JavascriptProcessingException(err)
          case Right(scoreable) => scoreable
        }
      }
    }
  }
}

class RhinoScopeBuilder(dependencyResolver: DependencyResolver, val components: Seq[Component])
  extends CoreLibs
  with GlobalScope {
  private lazy val logger = ContainerLogger.getLogger("RhinoScopeBuilder")

  lazy val files: Seq[String] = libs

  lazy val srcs: Seq[(String, String)] = {
    logger.trace("build srcs...")
    dependencyResolver.resolveComponents(components.map(_.id))
      .flatMap(toWrappedJsSrcAndName)
  }

  def wrappedComponentLibs(ls: LibrarySource): (String, String) = {
    (ls.name -> s"""
    (function(exports, require, module){
    ${ls.source};
    })(corespring.module("${ls.name}").exports, corespring.require, corespring.module("${ls.name}"));
    """)
  }

  def toNameAndSource(l: Seq[LibrarySource]): Seq[(String, String)] = l.map(wrappedComponentLibs)

  private def toWrappedJsSrcAndName(c: Component): Seq[(String, String)] = {
    c match {
      case i: Interaction => Seq(s"${i.org}-${i.name}" -> wrap(s"${i.org}-${i.name}", i.server.definition))
      case l: Library => toNameAndSource(l.server)
      case _ => Seq.empty
    }
  }

  private def wrap(name: String, js: String): String =
    s"""
       |(function(exports, require){
       |$js
       |})(corespring.server.logic('$name'), corespring.require);
     """.stripMargin

  def scope: Scriptable = globalScriptable.getOrElse {
    throw new RuntimeException("Error loading global scope - check the logs")
  }
}

class RhinoOutcomeProcessor(val components: Seq[Component], val scope: Scriptable) extends OutcomeProcessor {
  override def isInteraction(componentType: String): Boolean = components.exists(c => c.matchesType(componentType) && c.isInstanceOf[Interaction])

  override def serverLogic(componentType: String): ApiComponentServerLogic = new RhinoServerLogic(componentType, scope)
}

class RhinoPlayerItemPreProcessor(val components: Seq[Component], val scope: Scriptable) extends PlayerItemPreProcessor {
  override def serverLogic(componentType: String): ApiComponentServerLogic = new RhinoServerLogic(componentType, scope)
}

