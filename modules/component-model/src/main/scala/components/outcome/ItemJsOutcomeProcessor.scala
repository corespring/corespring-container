package org.corespring.container.components.outcome

import org.corespring.container.js.ItemAuthorOverride
import play.api.Logger
import play.api.libs.json.{Json, JsValue}

object ItemJsOutcomeProcessor extends OutcomeProcessor {

  lazy val logger = Logger("js.processing")

  def outcome(item: JsValue, session: JsValue, responses: JsValue): JsValue = {
    getScoringJs(item).map {
      jsDef =>
        val jsModuleWrapper = new ItemAuthorOverride {
          def js: String = jsDef
        }
        try{
          val result = jsModuleWrapper.process(item, (session \ "answers"))
          logger.debug(Json.stringify(result))
          result
        } catch {
          case e : Throwable => {
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

