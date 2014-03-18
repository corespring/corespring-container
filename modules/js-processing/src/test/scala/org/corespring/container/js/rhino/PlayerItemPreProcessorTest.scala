package org.corespring.container.js.rhino

import org.corespring.container.components.model.{ Server, UiComponent, Client }
import org.specs2.mutable.Specification
import play.api.libs.json.Json

class PlayerItemPreProcessorTest extends Specification {

  val interactionProcessJs =
    """
      |exports.render   =     function(json){
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
        Seq.empty)

      val item = Json.obj(
        "weight" -> "1",
        "components" -> Json.obj(
          "1" -> Json.obj(
            "componentType" -> "org-name",
            "model" -> "someModel",
            "correctResponse" -> Json.obj(
              "value" -> "1"))))

      val session = Json.obj(
        "components" -> Json.obj(
          "1" -> Json.obj(
            "itemSession" -> Json.obj("value" -> "2"),
            "stash" -> Json.obj())))

      val processor = new RhinoPlayerItemPreProcessor(Seq(component), Seq.empty)
      val result = processor.preProcessItemForPlayer(item, session)
      (result \ "components" \ "1" \ "dummy").as[String] === "something"
      (result \ "components" \ "1" \ "model").as[String] === "someModel"
      (result \ "weight").as[String] === "1"
    }

    "should not throw exception if render function doesnt exist" in {

      val component = UiComponent(
        "org",
        "name",
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

      val processor = new RhinoPlayerItemPreProcessor(Seq(component), Seq.empty)

      try {
        processor.preProcessItemForPlayer(item, Json.obj())
        success
      } catch {
        case x: Throwable => failure
      }
    }
  }

}
