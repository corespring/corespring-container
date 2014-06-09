package org.corespring.container.components.outcome

import org.specs2.mutable.Specification
import play.api.libs.json.{ JsString, JsValue, JsNumber, Json }

class ScoreProcessorSequenceTest extends Specification {

  "processor sequence" should {
    "process last score will overwrite earlier" in {
      val one = new ScoreProcessor {
        def score(item: JsValue, session: JsValue, responses: JsValue): JsValue = Json.obj("score" -> JsNumber(0.5), "value" -> JsString("hello"))
      }

      val two = new ScoreProcessor {
        def score(item: JsValue, session: JsValue, responses: JsValue): JsValue = Json.obj("score" -> JsNumber(0.4))
      }

      val processor = new ScoreProcessorSequence(one, two)
      val out = processor.score(Json.obj(), Json.obj(), Json.obj())

      (out \ "score").asOpt[Double] === Some(0.4)
      (out \ "value").asOpt[String] === Some("hello")
    }
  }
}
