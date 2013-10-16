package org.corespring.container.components.outcome

import play.api.libs.json.{JsNumber, JsObject, Json, JsValue}


trait OutcomeProcessor {
  def outcome(item: JsValue, session: JsValue, responses: JsValue): JsValue
}


