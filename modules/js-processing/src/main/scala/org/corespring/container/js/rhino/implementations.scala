package org.corespring.container.js.rhino

import org.corespring.container.js.api.{ ComponentServerLogic => ApiComponentServerLogic, ItemAuthorOverride => ApiItemAuthorOverride, JavascriptProcessingException, JavascriptError, GetServerLogic }
import org.mozilla.javascript.{ Function => RhinoFunction }
import org.mozilla.javascript.{ Scriptable, Context }
import org.corespring.container.js.processing.PlayerItemPreProcessor
import org.corespring.container.components.model.{ Component, Interaction, Library }
import org.corespring.container.js.response.OutcomeProcessor
import play.api.libs.json.{ JsValue, JsObject, Json }

trait CorespringJs {

  protected val libs = Seq(
    "/js-libs/lodash.min.js",
    "/js-libs/sax.js",
    "/js-libs/math.min.js",
    "/container-client/js/corespring/core-library.js",
    "/container-client/js/corespring/server/init-core-library.js",
    "/container-client/js/corespring/core.js")

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

trait RhinoGetServerLogic extends GetServerLogic {

  override def serverLogic(compType: String, definition: String, libraries: Seq[Library]): ApiComponentServerLogic = new ComponentServerLogic {

    override def componentType: String = compType

    override def js: String = definition

    override def componentLibs: Seq[(String, String)] = toNameAndSource(libraries)

    def toNameAndSource(s: Seq[Library]): Seq[(String, String)] = s.map(l => l.server.map(s => (s.name, s.source))).flatten
  }
}

class RhinoOutcomeProcessor(val components: Seq[Component]) extends OutcomeProcessor with RhinoGetServerLogic

class RhinoPlayerItemPreProcessor(val interactions: Seq[Interaction], val libraries: Seq[Library]) extends PlayerItemPreProcessor with RhinoGetServerLogic

