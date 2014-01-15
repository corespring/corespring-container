package org.corespring.container.components.outcome

import org.corespring.container.utils.string._
import org.specs2.mutable.Specification
import play.api.libs.json.{JsValue, Json}

class ItemJsScoreProcessorTest extends Specification {

  "ItemJsOutcomeProcessor" should {

    val js =
      """
        exports.process = function(item, answers){
          return { score : 0.39 };
        };
      """
    val item =
      s"""{
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
          },
          "files" : [
            {"name" : "scoring.js", "contentType" : "text/javascript", "content" : "${jsonSafe(js)}"}
          ]
         }"""

    val session = """{}"""

    val responses = """{}"""

    implicit def stringToJsValue(s: String): JsValue = Json.parse(s)

    "process using the js defined by the item" in {
      val out = ItemJsScoreProcessor.score(item, session, responses)
      (out \ "score").asOpt[Double] === Some(0.39)
    }
  }

}
