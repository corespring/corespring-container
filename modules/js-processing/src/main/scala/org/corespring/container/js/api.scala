package org.corespring.container.js

import play.api.libs.json.JsValue
import org.corespring.container.components.model.Library

object api {

  trait ComponentServerLogic {

    def createOutcome(question: JsValue, response: JsValue, settings: JsValue, targetOutcome: JsValue): JsValue

    def preProcessItem(question: JsValue, settings: JsValue): JsValue
  }

  trait ItemAuthorOverride {
    def process(item: JsValue, answers: JsValue): JsValue
  }

  trait GetServerLogic {
    def serverLogic(componentType: String, definition: String, libs: Seq[Library]): ComponentServerLogic
    //def componentLibs: Seq[(String, String)] = libraries.map(l => l.server.map(s => (s.name, s.source))).flatten

  }

  trait JavascriptError {
    def message: String
    def lineNo: Int
    def column: Int
    def source: String
    def name: String
  }

}
