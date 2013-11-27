package org.corespring.container.components.response

import org.corespring.container.components.model.{UiComponent, Server, Client}
import org.specs2.mutable.Specification
import play.api.libs.json.Json

class OutcomeProcessorImplTest extends Specification{

  val respondJs =
  """
    |exports.respond = function(question, answer, settings){
    |  var correct = question.correctResponse.value == answer.value;
    |  return { correctness: correct ? "correct" : "incorrect", answer : answer };
    |}
  """.stripMargin

  "OutcomeProcessor" should {
    "respond" in {

      val component = UiComponent(
        "org",
        "name",
        client = Client("", "", None),
        server = Server(respondJs),
        Json.obj(),
        Json.obj(),
        None,
        Map(),
        Seq.empty
      )


      val processor = new OutcomeProcessorImpl(Seq(component), Seq.empty)

      val item = Json.obj(
        "components" -> Json.obj(
            "1" -> Json.obj(
              "componentType" -> "org-name",
              "correctResponse" -> Json.obj(
                 "value" -> "1"
              )
            )
        )
      )

      val session = Json.obj(
        "components" -> Json.obj(
          "1" -> Json.obj(
            "answers" -> Json.obj( "value" -> "2"),
            "stash" -> Json.obj()
          )
        )
      )

      val result = processor.createOutcome(item, session, Json.obj())

      (result \ "1" \ "correctness").as[String] === "incorrect"

    }
  }

}
