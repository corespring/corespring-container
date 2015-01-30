package org.corespring.container.js.rhino

import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.{JsValue, Json}

class CustomScoringJsTest extends Specification {

    "Custom Scoring JS" should {

      val itemJs : String =   """
            exports.process = function(item, session, computedOutcomes){

              try{
                if(!computedOutcomes){
                  throw new Error("No computedOutcomes");
                }

                var one = computedOutcomes["1"];
                var two = computedOutcomes["2"];

                var score = 0;
                if(one.correctness === "correct" ){
                  score += 0.5;
                }

                if(two.correctness === "correct" ){
                  score += 0.5;
                }

                var correctness = score === 1 ? "correct" : "incorrect";

                return {
                  summary: {
                   score: score,
                   correctness: correctness,
                   response: "Custom score result"
                 }
                }
              } catch(e) {
                return { summary: { score: 0.0, response: "Error processing: " + e}}
              }
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
            },
            "2" : {
              "componentType" : "corespring-multiple-choice",
              "correctResponse" : { "value" : ["3"] },
              "model" : {
                "prompt": "What is 1 + 2?",
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


      case class scoreScope(outcomes:JsValue) extends Scope {

        val scorer = new CustomScoringJs {
          override def js: String = itemJs
        }

        lazy val out = scorer.process(item, session, outcomes)
      }

      def mkComputedOutcomes(one:String, two:String) = s"""{
        "1" : {
          "correctness" : "${if(one == "1.0") "correct" else "incorrect" }",
          "response" : "",
          "score" : $one
        },
        "2" : {
          "correctness" : "${if(two == "1.0") "correct" else "incorrect" }",
          "response" : "",
          "score" : $two
        }
      }
        """.stripMargin

      "returns 1.0 when both computedOutcomes are correct" in new scoreScope(mkComputedOutcomes("1.0", "1.0")){
        (out \ "summary" \ "score").asOpt[Double] === Some(1.0)
      }

      "returns 0.5 when one computedOutcomes is correct" in new scoreScope(mkComputedOutcomes("0.0", "1.0")){
        (out \ "summary" \ "score").asOpt[Double] === Some(0.5)
      }

      "returns 0.0 when neither computedOutcomes are correct" in new scoreScope(mkComputedOutcomes("0.0", "0.0")){
        (out \ "summary" \ "score").asOpt[Double] === Some(0.0)
      }

      "returns 0.0 when an error occurs" in new scoreScope("{}"){
        (out \ "summary" \ "score").asOpt[Double] === Some(0.0)
      }

      "processing returns an error message when an error occurs" in new scoreScope("{}"){
        (out \ "summary" \ "response").asOpt[String] === Some("Error processing: TypeError: Cannot read property \"correctness\" from undefined")
      }
    }

}
