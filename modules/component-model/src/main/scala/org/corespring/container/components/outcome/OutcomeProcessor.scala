package org.corespring.container.components.response

import play.api.libs.json.JsValue


trait OutcomeProcessor {

  /**  Create an score for an item given the responses and settings */
  def createOutcome(item:JsValue, responses: JsValue, settings: JsValue ) : JsValue
}

