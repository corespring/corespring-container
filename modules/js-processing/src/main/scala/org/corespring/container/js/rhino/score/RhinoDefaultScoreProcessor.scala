package org.corespring.container.js.rhino.score


import org.corespring.container.components.outcome.DefaultScoreProcessor
import org.corespring.container.js.rhino.RhinoServerLogic
import org.mozilla.javascript.Scriptable
import play.api.libs.json.JsValue

class RhinoDefaultScoreProcessor(scope:Scriptable) extends DefaultScoreProcessor{
  override def isComponentScoreable(compType: String, comp: JsValue, session: JsValue, outcome: JsValue): Boolean = {
    val serverLogic = new RhinoServerLogic(compType, scope)
    serverLogic.isScoreable(comp, session, outcome)
  }
}
