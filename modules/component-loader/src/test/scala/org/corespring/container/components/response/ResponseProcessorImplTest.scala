package org.corespring.container.components.response

import org.specs2.mutable.Specification
import org.corespring.container.components.model.{Server, Client, Component}
import play.api.libs.json.Json

class ResponseProcessorImplTest extends Specification{

  val respondJs =
  """
    |exports.respond = function(question, answer, settings){
    |  var correct = question.correctResponse.value == answer.value;
    |  return { correctness: correct ? "correct" : "incorrect", answer : answer };
    |}
  """.stripMargin

  "ResponseProcessor" should {
    "respond" in {

      val component = Component(
        "org",
        "name",
        client = Client("", "", None),
        server = Server(respondJs),
        Json.obj(),
        Json.obj(),
        None,
        Map()
      )


      val processor = new ResponseProcessorImpl(Seq(component))

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
        "answers" -> Json.obj(
          "1" -> Json.obj(
            "value" -> "2"
          )
        )
      )

      val result = processor.respond(item, session)

      (result \ "1" \ "correctness").as[String] === "incorrect"

    }
  }

}
