package org.corespring.container.js

import play.api.libs.json.JsValue
import org.corespring.container.components.model.Library

object api {

  trait ComponentServerLogic {

    def createOutcome(question: JsValue, response: JsValue, settings: JsValue, targetOutcome: JsValue): JsValue


    /**
     * Preprocess the item. If there is now implementation available - return the input
     * @param question
     * @return
     */
    def preProcessItem(question: JsValue): JsValue
  }

  trait CustomScoringJs {
    /**
     * Create a score object, bypassing any built in component scoring logic.
     * @param item
     * @param session
     * @return json : { score: 0.0 - 1.0 }
     */
    def process(item: JsValue, session:JsValue): JsValue
  }

  trait GetServerLogic {
    def serverLogic(componentType: String): ComponentServerLogic
  }

  trait JavascriptError {
    def message: String
    def lineNo: Int
    def column: Int
    def source: String
    def name: String
  }

  case class JavascriptProcessingException(e: JavascriptError) extends RuntimeException(e.message) {
    s"""
        message: ${e.message}
        source : ${e.source}
        line: ${e.lineNo}
        column: ${e.column}
     """
  }

}
