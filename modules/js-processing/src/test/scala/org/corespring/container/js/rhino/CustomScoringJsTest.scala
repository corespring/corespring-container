package org.corespring.container.js.rhino

import org.specs2.mutable.Specification
import play.api.libs.json.{ JsString, JsObject, Json }

class CustomScoringJsTest extends Specification {

  val customScoring = new CustomScoringJs {
    override def js: String =
      """
        |exports.process = function(item, answers){
        |  return {
        |    summary: {
        |      score: 0.5
        |    }
        |  }
        |}
      """.stripMargin
  }

  "CustomScoring" should {
    "invoke the js" in {
      customScoring.process(Json.obj(), Json.obj()) === Json.obj("summary" -> Json.obj("score" -> 0.5))
    }
  }
}
