package org.corespring.container.components.processing

import org.corespring.container.components.model.{UiComponent, Server, Client}
import org.specs2.mutable.Specification
import play.api.libs.json.Json

class ItemProcessorImplTest extends Specification{

  val interactionProcessJs =
    """
      |exports.render = function(json){
      |  json.dummy = "something";
      |  return json;
      |}
    """.stripMargin
  
  "ItemProcessor" should {
    "process" in {

      val component = UiComponent(
        "org",
        "name",
        client = Client("", "", None),
        server = Server(interactionProcessJs),
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
              "model" -> "someModel",
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

      val processor = new ItemProcessorImpl(Seq(component), Seq.empty)
      val result = processor.processItem(item, session)
      (result \ "1" \ "dummy").as[String] === "something"
      (result \ "1" \ "model").as[String] === "someModel"
    }
  }

}
