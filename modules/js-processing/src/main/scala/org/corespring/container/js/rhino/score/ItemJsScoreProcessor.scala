package org.corespring.container.js.rhino.score

import org.corespring.container.components.outcome.ScoreProcessor
import play.api.libs.json.{ Json, JsValue }
import org.corespring.container.js.rhino.ItemAuthorOverride
import org.corespring.container.logging.ContainerLogger

object ItemJsScoreProcessor extends ScoreProcessor {

  lazy val logger = ContainerLogger.getLogger("JsProcessing")

  def score(item: JsValue, session: JsValue, outcomes: JsValue): JsValue = {
    getScoringJs(item).map {
      jsDef =>
        val jsModuleWrapper = new ItemAuthorOverride {
          def js: String = jsDef
        }
        try {
          val result = jsModuleWrapper.process(item, outcomes)
          logger.debug(Json.stringify(result))
          result
        } catch {
          case e: Throwable => {
            logger.warn("Error running js", e)
            Json.obj()
          }
        }
    }.getOrElse(Json.obj())
  }

  private def getScoringJs(item: JsValue): Option[String] = for {
    files <- (item \ "files").asOpt[Seq[JsValue]]
    scoring <- files.find(json => (json \ "name").asOpt[String] == Some("scoring.js"))
    content <- (scoring \ "content").asOpt[String]
  } yield content
}

