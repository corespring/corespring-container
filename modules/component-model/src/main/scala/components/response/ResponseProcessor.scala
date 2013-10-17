package org.corespring.container.components.response

import play.api.libs.json.JsValue


trait ResponseProcessor {

  /** Respond to question */
  def respond(item:JsValue, session: JsValue ) : JsValue

}

