package org.corespring.container.js.outcome

import org.corespring.container.components.outcome.DefaultScoreProcessor
import org.corespring.container.js.rhino.RhinoServerLogic
import play.api.libs.json.JsValue

class RhinoDefaultScoreProcessor(serverLogic:RhinoServerLogic) extends DefaultScoreProcessor{
  override def isComponentScoreable(compType: String, comp: JsValue, session: JsValue, outcome: JsValue): Boolean = {
    serverLogic.isScoreable(comp, session, outcome)
  }
}
