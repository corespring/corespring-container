package org.corespring.container.components.response

import org.mozilla.javascript.{Function => RhinoFunction}
import org.specs2.matcher.Matcher
import org.specs2.mutable.Specification
import play.api.libs.json.{JsValue, Json, JsObject}
import scala.language.dynamics

class ResponseGeneratorTest extends Specification {


  val respondJs =
    """
      |var _ = require("underscore");
      |
      |exports.respond = function(question, answer, settings){
      |  var correct = question.correctResponse.value == answer.value;
      |  var feedback = [];
      |  var oneHundred = _.parseInt('100');
      |  for( var x = 0; x < question.feedback.length; x++) {
      |    if(question.feedback[x].value == answer.value){
      |      feedback.push( question.feedback[x] );
      |    }
      |  }
      |
      |  return { correctness: correct ? "correct" : "incorrect", feedback : feedback };
      |}
    """.stripMargin


  val question = Json.obj(
    "componentType" -> "org-name",
    "correctResponse" -> Json.obj("value" -> "1"),
    "feedback" -> Json.arr(
      Json.obj("value" -> "1", "feedback" -> "super"),
      Json.obj("value" -> "2", "feedback" -> "not super")
    )
  )

  "ResponseGenerator" should {

    val beRightResponse: Matcher[(String, String, String)] = (set: (String, String, String)) => {
      val (value, expectedCorrectness, expectedFeedback) = set
      val answer = Json.obj("value" -> value)
      val generator = new OutcomeGenerator("comp", respondJs, Seq.empty)
      val response = generator.createOutcome(question, answer, JsObject(Seq.empty))
      (response \ "correctness").as[String] === expectedCorrectness
      val feedback: Seq[JsValue] = (response \ "feedback").as[Seq[JsValue]]
      (feedback(0) \ "feedback").as[String] === expectedFeedback
    }

    "generate" in {
      ("2", "incorrect", "not super") must beRightResponse
      ("1", "correct", "super") must beRightResponse
    }

  }
}
