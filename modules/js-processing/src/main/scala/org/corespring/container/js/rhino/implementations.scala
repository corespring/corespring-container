package org.corespring.container.js.rhino

import org.corespring.container.components.model.dependencies.DependencyResolver
import org.corespring.container.components.model.{LibrarySource, Interaction, Component, Library}
import org.corespring.container.js.api.{GetServerLogic, JavascriptError, JavascriptProcessingException, ComponentServerLogic => ApiComponentServerLogic, ItemAuthorOverride => ApiItemAuthorOverride}
import org.corespring.container.js.processing.PlayerItemPreProcessor
import org.corespring.container.js.response.OutcomeProcessor
import org.mozilla.javascript.tools.shell.Global
import org.mozilla.javascript.{Function => RhinoFunction, ScriptableObject, Context, Scriptable}
import play.api.libs.json.{JsObject, JsValue, Json}

trait CoreLibs {

  protected val libs = Seq(
    "/js-libs/lodash.min.js",
    "/js-libs/sax.js",
    "/js-libs/math.min.js",
    "/container-client/js/corespring/core-library.js",
    "/container-client/js/corespring/server/init-core-library.js",
    "/container-client/js/corespring/core.js")

}

trait CorespringJs extends CoreLibs{


  def js: String

  def exports: String

  def wrapped = s"""
    (function(exports, require){
      $js
    })($exports, corespring.require);
  """
}

trait ItemAuthorOverride
  extends ApiItemAuthorOverride
  with JsContext
  with JsFunctionCalling
  with CorespringJs {

  override def exports = "corespring.server.itemOverride()"

  private def getOverrideObject(ctx: Context, scope: Scriptable): Scriptable = {
    val corespring = scope.get("corespring", scope).asInstanceOf[Scriptable]
    val server = corespring.get("server", corespring).asInstanceOf[Scriptable]
    val overrideFn = server.get("itemOverride", server).asInstanceOf[RhinoFunction]
    val obj = overrideFn.call(ctx, scope, server, Array())
    obj.asInstanceOf[Scriptable]
  }

  def process(item: JsValue, answers: JsValue): JsValue = {
    val result = withJsContext[JsValue](libs) {
      (ctx: Context, scope: Scriptable) =>
        implicit val rootScope = scope
        implicit val rootContext = ctx
        ctx.evaluateString(scope, wrapped, s"itemAuthorOverride.process", 1, null)
        val overrideObject = getOverrideObject(ctx, scope)
        val processFn = overrideObject.get("process", overrideObject).asInstanceOf[RhinoFunction]
        callJsFunction(wrapped, processFn, overrideObject, Array(item, answers))
    }

    result match {
      case Left(err) => throw JavascriptProcessingException(err)
      case Right(json) => json
    }
  }
}

class NewServerLogic(componentType: String, scope: Scriptable)
  extends ApiComponentServerLogic
  with JsFunctionCalling {

  private def serverLogic(ctx: Context, scope: Scriptable): Scriptable = {
    val corespring = scope.get("corespring", scope).asInstanceOf[Scriptable]
    val server = corespring.get("server", corespring).asInstanceOf[Scriptable]
    val logic = server.get("logic", server).asInstanceOf[RhinoFunction]
    val serverLogic = logic.call(ctx, scope, logic, Array(Context.javaToJS(componentType, scope)))
    serverLogic.asInstanceOf[Scriptable]
  }

  override def createOutcome(question: JsValue, response: JsValue, settings: JsValue, targetOutcome: JsValue): JsValue = {

    try {
      val context = Context.enter()
      val server = serverLogic(context, scope)
      //TODO: rename 'respond' => 'createOutcome' in the components
      val respondFunction = server.get("respond", server).asInstanceOf[RhinoFunction]
      val result = callJsFunction("", respondFunction, server, Array(question, response, settings, targetOutcome))(context,scope)
      result match {
        case Left(err) => {
          logger.error(err.message)
          throw new JavascriptProcessingException(err)
        }
        case Right(json) => json.asInstanceOf[JsObject] ++ Json.obj("studentResponse" -> response)
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

  override def preProcessItem(question: JsValue): JsValue = Json.obj()
}

trait ComponentServerLogic
  extends ApiComponentServerLogic
  with JsContext
  with JsFunctionCalling
  with CorespringJs {

  def componentType: String

  def componentLibs: Seq[(String, String)]

  def wrappedComponentLibs: Seq[(String, String)] = componentLibs.map {
    tuple =>
      val (fullName, src) = tuple
      (fullName -> s"""
    (function(exports, require, module){
    $src;
    })(corespring.module("$fullName").exports, corespring.require, corespring.module("$fullName"));
    """)
  }

  override def exports = s"corespring.server.logic('$componentType')"

  private def serverLogic(ctx: Context, scope: Scriptable): Scriptable = {
    val corespring = scope.get("corespring", scope).asInstanceOf[Scriptable]
    val server = corespring.get("server", corespring).asInstanceOf[Scriptable]
    val logic = server.get("logic", server).asInstanceOf[RhinoFunction]

    val serverLogic = logic.call(ctx, scope, logic, Array(Context.javaToJS(componentType, scope)))
    serverLogic.asInstanceOf[Scriptable]
  }

  def createOutcome(question: JsValue, response: JsValue, settings: JsValue, targetOutcome: JsValue): JsValue = {
    val result: Either[JavascriptError, JsValue] = withJsContext[JsValue](libs, wrappedComponentLibs) {
      (ctx: Context, scope: Scriptable) =>
        implicit val rootScope = scope
        implicit val rootContext = ctx
        ctx.evaluateString(scope, wrapped, s"$componentType.createOutcome", 1, null)
        val server = serverLogic(ctx, scope)
        //TODO: rename 'respond' => 'createOutcome' in the components
        val respondFunction = server.get("respond", server).asInstanceOf[RhinoFunction]
        callJsFunction(wrapped, respondFunction, server, Array(question, response, settings, targetOutcome)) match {
          case Left(err) => throw JavascriptProcessingException(err)
          case Right(json) => {
            json.asOpt[JsObject] match {
              case Some(jsObj) => Right(jsObj ++ Json.obj("studentResponse" -> response))
              case _ => Right(json)
            }
          }
        }
    }

    result match {
      case Left(err) => throw JavascriptProcessingException(err)
      case Right(json) => json
    }
  }

  override def preProcessItem(question: JsValue): JsValue = {
    val result = withJsContext[JsValue](libs, wrappedComponentLibs) {
      (ctx: Context, scope: Scriptable) =>
        implicit val rootScope = scope
        implicit val rootContext = ctx
        ctx.evaluateString(scope, wrapped, s"$componentType.preProcessItem", 1, null)
        val server = serverLogic(ctx, scope)
        val renderFunction = server.get("render", server).asInstanceOf[RhinoFunction]
        callJsFunction(wrapped, renderFunction, server, Array(question))
    }

    result match {
      case Left(err) => throw JavascriptProcessingException(err)
      case Right(json) => json
    }
  }
}

trait NewRhinoGetServerLogic extends GetServerLogic with GlobalScope{
  override def serverLogic(componentType: String, definition: String, libs: Seq[Library]): ApiComponentServerLogic = globalScriptable.map{ gs =>
    new NewServerLogic(componentType, gs)
  }.getOrElse(throw new RuntimeException("Global Scriptable is empty - check the logs there must have been a js error"))
}

trait RhinoGetServerLogic extends GetServerLogic {

  override def serverLogic(compType: String, definition: String, libraries: Seq[Library]): ApiComponentServerLogic = new ComponentServerLogic {

    override def componentType: String = compType

    override def js: String = definition

    override def componentLibs: Seq[(String, String)] = toNameAndSource(libraries)

    def toNameAndSource(s: Seq[Library]): Seq[(String, String)] = s.map(l => l.server.map(s => (s.name, s.source))).flatten
  }
}

class RhinoOutcomeProcessor(val components: Seq[Component]) extends OutcomeProcessor with RhinoGetServerLogic

class NewRhinoOutcomeProcessor(val components: Seq[Component])
  extends OutcomeProcessor
  with NewRhinoGetServerLogic
  with CoreLibs
  with DependencyResolver{
  import org.corespring.container.logging.ContainerLogger
   override lazy val logger = ContainerLogger.getLogger("NewRhinoOutcomeProcessor")

  lazy val files: Seq[String] = libs

  lazy val srcs: Seq[(String, String)] = {
    logger.trace("build srcs...")
    resolveComponents(components.map(_.id)).flatMap(toWrappedJsSrcAndName)
  }


  def wrappedComponentLibs(ls:LibrarySource): (String,String) = {
      (ls.name -> s"""
    (function(exports, require, module){
    ${ls.source};
    })(corespring.module("${ls.name}").exports, corespring.require, corespring.module("${ls.name}"));
    """)
  }

  def toNameAndSource(l: Seq[LibrarySource]): Seq[(String, String)] = l.map(wrappedComponentLibs)

  private def toWrappedJsSrcAndName(c:Component) : Seq[(String,String)] = {
    c match {
      case Interaction(org,name,_,_,_,server,_,_,_,_,_) => Seq(s"$org-$name" -> wrap(s"$org-$name", server.definition))
      case Library(org, name, _, _, server, _, _) => toNameAndSource(server)
      case _ => Seq.empty
    }
  }

  private def wrap(name:String, js:String) : String =
    s"""
       |(function(exports, require){
       |$js
       |})(corespring.server.logic('$name'), corespring.require);
     """.stripMargin
}

class RhinoPlayerItemPreProcessor(val components: Seq[Component]) extends PlayerItemPreProcessor with RhinoGetServerLogic

