package org.corespring.container.components.outcome

import org.specs2.mutable.Specification
import play.api.libs.json._

class ScoreProcessorSequenceTest extends Specification {

  "processor sequence" should {
    "process last score will overwrite earlier" in {
      val one = new ScoreProcessor {
        def score(item: JsValue, session: JsValue, outcomes: JsValue): JsValue = Json.obj(
          "summary" -> Json.obj(
            "score" -> 1
          ),
          "components" -> Json.obj(
            "1" -> Json.obj(
              "score" -> 1,
              "weight" -> 1
            )
          ))
      }

      val two = new ScoreProcessor {
        def score(item: JsValue, session: JsValue, outcomes: JsValue): JsValue = Json.obj(
          "summary" -> Json.obj(
            "score" -> JsNumber(0.4)
          )
        )
      }

      val processor = new ScoreProcessorSequence(one, two)
      val out = processor.score(Json.obj(), Json.obj(), Json.obj())

      (out \ "summary" \ "score").asOpt[Double] === Some(0.4)
      (out \ "components" \ "1" ).asOpt[JsObject] === Some(Json.obj("score" -> 1, "weight" -> 1))
    }
  }
}
