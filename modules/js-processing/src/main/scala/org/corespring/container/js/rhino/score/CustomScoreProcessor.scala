package org.corespring.container.js.rhino.score

import org.corespring.container.components.outcome.ScoreProcessor
import play.api.libs.json.{ Json, JsValue }
import org.corespring.container.js.rhino.CustomScoringJs
import org.corespring.container.logging.ContainerLogger

object CustomScoreProcessor extends ScoreProcessor {

  lazy val logger = ContainerLogger.getLogger("CustomScoreProcessor")

  override def score(item: JsValue, session: JsValue, outcomes: JsValue): JsValue = {

    logger.debug(s"[score]")

    (item \ "customScoring").asOpt[String].map {
      jsDef =>
        val jsModuleWrapper = new CustomScoringJs {
          def js: String = jsDef
        }
        try {
          val result = jsModuleWrapper.process(item, session, outcomes)
          logger.trace(s"result: ${Json.stringify(result)}")
          result
        } catch {
          case e: Throwable => {
            if (logger.isDebugEnabled) {
              e.printStackTrace()
            }
            logger.warn("Error running js", e)
            Json.obj()
          }
        }
    }.getOrElse(Json.obj())
  }

}

