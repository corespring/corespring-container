package org.corespring.container.components.outcome

import play.api.libs.json.{Json, JsValue}
import org.corespring.container.js.ModuleWrapperImpl
import play.api.Logger

object ItemJsOutcomeProcessor extends OutcomeProcessor {

  lazy val logger = Logger("js.processing")

  def outcome(item: JsValue, session: JsValue, responses: JsValue): JsValue = {
    getScoringJs(item).map {
      jsDef =>
        val jsModuleWrapper = new ModuleWrapperImpl{
          def js: String = jsDef
        }
        try{
          val result = jsModuleWrapper.run("process", item, (session \ "answers").as[JsValue])
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

