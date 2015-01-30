package org.corespring.container.js.rhino.score

import org.apache.commons.lang3.StringEscapeUtils
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.{ JsValue, Json }

class CustomScoreProcessorTest extends Specification {

  import StringEscapeUtils._

  "Custom Scoring" should {

    val errorJs =
      """
        exports.process = function(item, session, computedOutcomes){
          throw new Error("Error!");
        };
      """

    val okJs =
      """
        exports.process = function(item, session, computedOutcomes){
          return {
            summary: {
              score: 1.0
            }
          }
        };
      """

    "returns an empty object if there is no customScoring" in {
      CustomScoreProcessor.score(Json.obj(), Json.obj(), Json.obj()) === Json.obj()
    }

    "returns an empty object if there is is an error with customScoring" in {
      val item = Json.obj("customScoring" -> errorJs)
      CustomScoreProcessor.score(item, Json.obj(), Json.obj()) === Json.obj()
    }

    "returns a result from the js function" in {
      val item = Json.obj("customScoring" -> okJs)
      CustomScoreProcessor.score(item, Json.obj(), Json.obj()) === Json.obj("summary" -> Json.obj("score" -> 1.0))
    }
  }

}
