package org.corespring.container.components.response

import play.api.libs.json.JsValue


trait ResponseProcessor {

  /** Respond to question */
  @deprecated("use the respond method below, where you only pass in the answers", "")
  def respond(item:JsValue, session: JsValue ) : JsValue
  def respond(item:JsValue, answers: JsValue, settings: JsValue ) : JsValue

}

