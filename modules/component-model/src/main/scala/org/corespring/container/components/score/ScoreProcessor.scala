package org.corespring.container.components.outcome

import play.api.libs.json.JsValue

trait ScoreProcessor {
  def score(item: JsValue, session: JsValue, outcomes: JsValue): JsValue

}

