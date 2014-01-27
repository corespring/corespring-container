package org.corespring.container.components.response.rhino

import org.corespring.container.components.model.{UiComponent, Server, Client}
import org.specs2.mutable.Specification
import play.api.libs.json.{JsString, Json}

class OutcomeProcessorTest extends Specification{

  val interactionRespondJs =
  """
    |exports.respond = function(question, answer, settings){
    |  var correct = question.correctResponse.value == answer.value;
    |  return { correctness: correct ? "correct" : "incorrect", answer : answer };
    |}
  """.stripMargin
  
  val feedbackRespondJs =
  """
    |exports.respond = function(question, answer, settings, targetOutcome){
    |  return { targetOutcome: targetOutcome };
    |}
  """.stripMargin

  "Target" should  {
    "work" in {
      val t = new Target{}
      t.hasTarget(Json.obj("target" -> Json.obj("id" -> JsString("1")))) === true
      t.hasTarget(Json.obj("target" -> Json.obj("otherId" -> JsString("1")))) === false
      t.hasTarget(Json.obj()) === false
    }

  }



  "OutcomeProcessor" should {
    "respond" in {

      val component = UiComponent(
        "org",
        "name",
        client = Client("", "", None),
        server = Server(interactionRespondJs),
        Json.obj(),
        Json.obj(),
        None,
        Map(),
        Seq.empty
      )

      val feedback = UiComponent(
        "org",
        "feedback",
        client = Client("", "", None),
        server = Server(feedbackRespondJs),
        Json.obj(),
        Json.obj(),
        None,
        Map(),
        Seq.empty
      )

      val item = Json.obj(
        "components" -> Json.obj(
            "1" -> Json.obj(
              "componentType" -> "org-name",
              "correctResponse" -> Json.obj(
                 "value" -> "1"
              )
            ),
            "2" -> Json.obj(
              "componentType" -> "org-feedback",
              "target" -> Json.obj(
                 "id" -> "1"
              )
            )
        )
      )

      val session = Json.obj(
        "components" -> Json.obj(
          "1" -> Json.obj(
            "answers" -> Json.obj( "value" -> "2"),
            "stash" -> Json.obj()
          ),
          "2" -> Json.obj(
            "answers" -> Json.obj()
          )
        )
      )

      val processor = new OutcomeProcessor(Seq(component, feedback), Seq.empty)
      val result = processor.createOutcome(item, session, Json.obj())
      (result \ "1" \ "correctness").as[String] === "incorrect"
      (result \ "2" \ "targetOutcome" \ "correctness").as[String] === "incorrect"

    }
  }

}
