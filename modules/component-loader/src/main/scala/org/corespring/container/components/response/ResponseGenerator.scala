package org.corespring.container.components.response

import org.corespring.container.js.ModuleWrapperImpl
import play.api.libs.json.JsValue

class ResponseGenerator(definition: String, question: JsValue, answer: JsValue, settings: JsValue) extends ModuleWrapperImpl {

  override def js: String = definition

  def respond: JsValue = run("respond", question, answer, settings)
}
