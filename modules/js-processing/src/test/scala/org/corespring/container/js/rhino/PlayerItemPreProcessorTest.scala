package org.corespring.container.js.rhino

import org.corespring.container.components.model.{ Interaction, Server, Client }
import org.specs2.mutable.Specification
import play.api.libs.json.Json

class PlayerItemPreProcessorTest extends Specification {

  val interactionProcessJs =
    """
      |exports.preprocess   =     function(json){
      |  json.dummy = "something";
      |  return json;
      |}
    """.stripMargin

  "ItemProcessor" should {

    "process" in {

      val interaction = Interaction(
        "org",
        "name",
        true,
        false,
        None,
        None,
        client = Client("", "", None),
        server = Server(interactionProcessJs),
        Json.obj(),
        Json.obj(),
        None,
        Map(),
        Seq.empty)

      val item = Json.obj(
        "weight" -> "1",
        "components" -> Json.obj(
          "1" -> Json.obj(
            "componentType" -> "org-name",
            "model" -> "someModel",
            "correctResponse" -> Json.obj(
              "value" -> "1"))))

      val builder = new RhinoScopeBuilder(Seq(interaction))
      val processor = new RhinoPlayerItemPreProcessor(Seq(interaction), builder.scope)
      val result = processor.preProcessItemForPlayer(item)
      (result \ "components" \ "1" \ "dummy").as[String] === "something"
      (result \ "components" \ "1" \ "model").as[String] === "someModel"
      (result \ "weight").as[String] === "1"
    }

    "should not throw exception if render function doesnt exist" in {

      val interaction = Interaction(
        "org",
        "name",
        true,
        false,
        None,
        None,
        client = Client("", "", None),
        server = Server(""),
        Json.obj(),
        Json.obj(),
        None,
        Map(),
        Seq.empty)

      val item = Json.obj(
        "weight" -> "1",
        "components" -> Json.obj(
          "1" -> Json.obj(
            "componentType" -> "org-name",
            "model" -> "someModel",
            "correctResponse" -> Json.obj(
              "value" -> "1"))))

      val builder = new RhinoScopeBuilder(Seq(interaction))
      val processor = new RhinoPlayerItemPreProcessor(Seq(interaction), builder.scope)

      try {
        processor.preProcessItemForPlayer(item)
        success
      } catch {
        case x: Throwable => failure
      }
    }
  }

}
