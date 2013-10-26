package org.corespring.container.components.outcome

import play.api.libs.json.{Json, JsString, JsObject, JsValue}
import play.api.Logger

/**
 * Run process on a seq of processers and fold the result..
 * @param processors
 */
class OutcomeProcessorSequence(processors : OutcomeProcessor*) extends OutcomeProcessor{
  lazy val logger = Logger("outcome.processor")

  def outcome(item: JsValue, session : JsValue, responses: JsValue): JsValue = {

    val outcomes = processors.map{ _.outcome(item, session, responses)}

    outcomes.foldLeft(JsObject(Seq.empty)){ (acc: JsObject, o : JsValue) =>
      o match {
        case obj : JsObject => {
          acc ++ obj
        }
        case _ => acc
      }
    }
  }
}

