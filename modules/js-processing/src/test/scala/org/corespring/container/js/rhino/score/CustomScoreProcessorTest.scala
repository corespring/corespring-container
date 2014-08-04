package org.corespring.container.js.rhino.score

import org.apache.commons.lang3.StringEscapeUtils
import org.specs2.mutable.Specification
import play.api.libs.json.{ JsValue, Json }

class CustomScoreProcessorTest extends Specification {

  import StringEscapeUtils._

  "Custom Scoring" should {

    val js =
      """
        exports.process = function(item, session){
          return {
            summary : {
              score : 0.39
            }
          }
        };
      """
    val item =
      s"""{
          "customScoring" : "${escapeEcmaScript(js)}",
          "components" : {
            "1" : {
              "componentType" : "corespring-multiple-choice",
              "correctResponse" : { "value" : ["2"] },
              "model" : {
                "prompt": "What is 1 + 1?",
                "choices": [
                  {"label": "1", "value": "1"},
                  {"label": "2", "value": "2"},
                  {"label": "3", "value": "3"},
                  {"label": "4", "value": "4"}
                ]
              }
            }
          }
         }"""

    val session = """{}"""

    implicit def stringToJsValue(s: String): JsValue = Json.parse(s)

    "process using the js defined by the item" in {
      val out = CustomScoreProcessor.score(item, session, Json.obj())
      (out \ "summary" \ "score").asOpt[Double] === Some(0.39)
    }
  }

}
