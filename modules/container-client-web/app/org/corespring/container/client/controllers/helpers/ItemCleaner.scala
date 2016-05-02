package org.corespring.container.client.controllers.helpers

import play.api.libs.json._
import org.jsoup._

/**
 * A helper utility to "clean"/validate item content before save.
 */
object ItemCleaner {

  def optionClean(markup: String, json: JsObject): Option[JsObject] = {
    def hasComponent(id: String) = Option(Jsoup.parse(markup).select(s"#${id}").first()).nonEmpty
    (json \ "components").asOpt[JsObject] match {
      case Some(obj) =>
        Some(json ++ Json.obj("components" -> JsObject(obj.fields.filter{ case (id, _) => hasComponent(id) })))
      case _ => None
    }
  }

  def clean(markup: String, json: JsObject): JsObject = optionClean(markup, json).getOrElse(json)

}
