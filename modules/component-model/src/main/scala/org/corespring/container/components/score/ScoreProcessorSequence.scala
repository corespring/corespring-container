package org.corespring.container.components.outcome

import play.api.libs.json.{Json, JsString, JsObject, JsValue}
import play.api.Logger

/**
 * Run process on a seq of processers and fold the result..
 * @param processors
 */
class ScoreProcessorSequence(processors : ScoreProcessor*) extends ScoreProcessor{
  lazy val logger = Logger("score.processor")

  def score(item: JsValue, session : JsValue, responses: JsValue): JsValue = {

    val outcomes = processors.map{ _.score(item, session, responses)}

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

