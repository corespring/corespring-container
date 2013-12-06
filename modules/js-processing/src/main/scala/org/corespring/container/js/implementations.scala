package org.corespring.container.js

import org.mozilla.javascript.{Function => RhinoFunction}
import org.mozilla.javascript.{Scriptable, Context}
import play.api.libs.json.JsValue

trait CorespringJs {

  //TODO: How to share corespring-core.js with client and server
  protected val libs = Seq(
    "/js-libs/lodash.min.js",
    "/container-client/js/corespring/core-library.js",
    "/container-client/js/corespring/core.js"
  )

  def js : String

  def exports: String

  def wrapped = s"""
    (function(exports, require){
      $js
    })($exports, corespring.require);
  """
}

trait ItemAuthorOverride
  extends JsContext
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

  def process(item: JsValue, answers: JsValue): JsValue = withJsContext(libs) {
    (ctx: Context, scope: Scriptable) =>
      implicit val rootScope = scope
      implicit val rootContext = ctx
      ctx.evaluateString(scope, wrapped, "<cmd>", 1, null)
      val overrideObject = getOverrideObject(ctx, scope)
      val processFn = overrideObject.get("process", overrideObject).asInstanceOf[RhinoFunction]
      val jsonResult = callJsFunction(wrapped, processFn, overrideObject, Array(item, answers))
      jsonResult
  }
}


trait ComponentServerLogic
  extends JsContext
  with JsFunctionCalling
  with CorespringJs {

  def componentType:String

  def componentLibs:Seq[(String,String)]

  def wrappedComponentLibs = componentLibs.map{ tuple =>
    val (fullName, src) = tuple
    s"""
    (function(exports, require, module){
    $src;
    })(corespring.module("$fullName").exports, corespring.require, corespring.module("$fullName"));
    """
  }

  override def exports = s"corespring.server.logic('$componentType')"

  private def serverLogic(ctx: Context, scope: Scriptable): Scriptable = {
    val corespring = scope.get("corespring", scope).asInstanceOf[Scriptable]
    val server = corespring.get("server", corespring).asInstanceOf[Scriptable]
    val logic = server.get("logic", server).asInstanceOf[RhinoFunction]
    val serverLogic = logic.call(ctx, scope, logic, Array(Context.javaToJS(componentType, scope)))
    serverLogic.asInstanceOf[Scriptable]
  }

  def createOutcome(question: JsValue, response: JsValue, settings: JsValue, targetOutcome: JsValue): JsValue = withJsContext(libs, wrappedComponentLibs) {
    (ctx: Context, scope: Scriptable) =>
      implicit val rootScope = scope
      implicit val rootContext = ctx
      ctx.evaluateString(scope, wrapped, "<cmd>", 1, null)
      val server = serverLogic(ctx, scope)
      //TODO: rename 'respond' => 'createOutcome' in the components
      val respondFunction = server.get("respond", server).asInstanceOf[RhinoFunction]
      val jsonResult = callJsFunction(wrapped, respondFunction, server, Array(question, response, settings, targetOutcome))
      jsonResult
  }
}
