package org.corespring.container.components.outcome

import org.specs2.mutable.Specification
import play.api.libs.json.{JsString, JsValue, JsNumber, Json}

class OutcomeProcessorSequenceTest extends Specification{

  "processor sequence" should {
    "process last outcome will overwrite earlier" in {
      val one = new OutcomeProcessor {
        def outcome(item: JsValue, session: JsValue, responses: JsValue): JsValue = Json.obj("score" -> JsNumber(0.5), "value" -> JsString("hello"))
      }

      val two = new OutcomeProcessor {
        def outcome(item: JsValue, session:JsValue, responses: JsValue): JsValue = Json.obj("score" -> JsNumber(0.4))
      }

      val processor = new OutcomeProcessorSequence(one, two)
      val out =  processor.outcome(Json.obj(), Json.obj(), Json.obj())

      (out  \ "score").asOpt[Double] === Some(0.4)
      (out \ "value").asOpt[String] === Some("hello")
    }
  }
}
