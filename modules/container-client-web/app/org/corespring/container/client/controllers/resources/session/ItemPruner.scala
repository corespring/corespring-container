package org.corespring.container.client.controllers.resources.session

import play.api.libs.json._
import grizzled.slf4j.Logger

trait ItemPruner {

  def logger: Logger

  val pruneFeedback = (__ \ "feedback").json.prune
  val pruneCorrectResponse = (__ \ "correctResponse").json.prune
  val pruneBoth = pruneFeedback andThen pruneCorrectResponse

  def pruneItem(item: JsValue): JsValue = {
    val comps = (item \ "components").as[JsObject]

    val trimmedComponents: Seq[(String, JsValue)] = comps.fields.map {
      (tuple: (String, JsValue)) =>
        val (key, json) = tuple
        val pruned = json.transform(pruneBoth)
        pruned match {
          case JsSuccess(updated, _) => (key, updated)
          case JsError(error) => (key, Json.obj())
        }
    }

    val updated = item.as[JsObject].fields.map { tuple =>
      val (key, json) = tuple
      if (key == "components") (key, JsObject(trimmedComponents)) else (key, json)
    }

    JsObject(updated)
  }
}
