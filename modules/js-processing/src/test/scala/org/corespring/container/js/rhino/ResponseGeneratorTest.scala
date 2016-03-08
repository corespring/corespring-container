package org.corespring.container.js.rhino

import org.corespring.container.components.model.{Component, Server}
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.corespring.container.components.services.{ComponentService, DependencyResolver}
import org.mozilla.javascript.{Function => RhinoFunction}
import org.specs2.matcher.Matcher
import org.specs2.mutable.Specification
import play.api.libs.json.{JsObject, JsValue, Json}

import scala.language.dynamics

class ResponseGeneratorTest extends Specification with ComponentMaker {

  val respondJs =
    """
      |var _ = require("underscore");
      |
      |exports.createOutcome = function(question, answer, settings){
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
      Json.obj("value" -> "2", "feedback" -> "not super")))

  private def mkService(comps:Component*) = new ComponentService{
    override def components: Seq[Component] = comps
  }

  "ResponseGenerator" should {

    val beRightResponse: Matcher[(String, String, String)] = (set: (String, String, String)) => {
      val (value, expectedCorrectness, expectedFeedback) = set
      val answer = Json.obj("value" -> value)

      val comps = Seq(
        uiComp("comp-type-tester", Seq.empty).copy(server = Server(respondJs)))
      val service = mkService(comps : _*)
      val resolver = new DependencyResolver(service)
      val builder = new RhinoScopeBuilder(resolver, service.components)
//      val builder = new RhinoScopeBuilder(Seq(
//        uiComp("comp-type-tester", Seq.empty).copy(server = Server(respondJs))))

      val serverLogic = new RhinoServerLogic("org-comp-type-tester", builder.scope)

      val response = serverLogic.createOutcome(question, answer, JsObject(Seq.empty), JsObject(Seq.empty))
      (response \ "correctness").as[String] === expectedCorrectness
      (response \ "studentResponse" \ "value").as[String] === value.toString
      val feedback: Seq[JsValue] = (response \ "feedback").as[Seq[JsValue]]
      (feedback(0) \ "feedback").as[String] === expectedFeedback

    }

    "generate" in {
      ("2", "incorrect", "not super") must beRightResponse
      ("1", "correct", "super") must beRightResponse
    }

  }
}
