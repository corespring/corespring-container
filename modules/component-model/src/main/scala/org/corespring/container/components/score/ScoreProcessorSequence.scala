package org.corespring.container.components.outcome

import play.api.libs.json.{ Json, JsString, JsObject, JsValue }
import play.api.Logger
import org.corespring.container.logging.ContainerLogger

/**
 * Run process on a seq of processers and fold the result..
 * @param processors
 */
class ScoreProcessorSequence(processors: ScoreProcessor*) extends ScoreProcessor {
  lazy val logger = ContainerLogger.getLogger("ScoreProcessor")

  override def score(item: JsValue, session: JsValue, outcomes: JsValue): JsValue = {

    val scores = processors.map { _.score(item, session, outcomes) }

    logger.trace(s"scores: $scores")
    scores.foldLeft(JsObject(Seq.empty)) { (acc: JsObject, o: JsValue) =>
      o match {
        case obj: JsObject => {
          acc ++ obj
        }
        case _ => acc
      }
    }
  }
}

