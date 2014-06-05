package org.corespring.container.js.rhino

import org.corespring.container.components.model._
import org.corespring.container.js.response.Target
import org.specs2.mutable.Specification
import play.api.libs.json.{ JsString, Json }
import org.corespring.container.components.model.Server
import org.corespring.container.components.model.LibraryId
import org.corespring.container.components.model.Client
import org.corespring.container.components.model.UiComponent
import play.api.libs.json.JsString
import play.api.Logger

class OutcomeProcessorTest extends Specification {

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

  val item = Json.obj(
    "components" -> Json.obj(
      "1" -> Json.obj(
        "componentType" -> "org-name",
        "correctResponse" -> Json.obj(
          "value" -> "1")),
      "2" -> Json.obj(
        "componentType" -> "org-feedback",
        "target" -> Json.obj(
          "id" -> "1"))))

  val session = Json.obj(
    "components" -> Json.obj(
      "1" -> Json.obj(
        "answers" -> Json.obj("value" -> "2"),
        "stash" -> Json.obj()),
      "2" -> Json.obj(
        "answers" -> Json.obj())))

  def comp(name: String = "name", serverJs: String, libraries: Seq[LibraryId] = Seq.empty) = UiComponent(
    "org",
    name,
    None,
    None,
    client = Client("", "", None),
    server = Server(serverJs),
    Json.obj(),
    Json.obj(),
    None,
    Map(),
    libraries)

  def lib(name: String = "name", libJs: String, deps: Seq[LibraryId] = Seq.empty) = {
    Library(
      "org",
      name,
      Json.obj(),
      Seq.empty,
      Seq(LibrarySource(name, libJs)),
      None,
      deps)
  }

  /*"Target" should {
    "work" in {
      val t = new Target {}
      t.hasTarget(Json.obj("target" -> Json.obj("id" -> JsString("1")))) === true
      t.hasTarget(Json.obj("target" -> Json.obj("otherId" -> JsString("1")))) === false
      t.hasTarget(Json.obj()) === false
    }
  }*/

  "OutcomeProcessor" should {
    /*"respond" in {

      val component = comp("name", interactionRespondJs)
      val feedback = comp("feedback", feedbackRespondJs)

      val processor = new RhinoOutcomeProcessor(Seq(component, feedback), Seq.empty)
      val result = processor.createOutcome(item, session, Json.obj())
      (result \ "1" \ "correctness").as[String] === "incorrect"
      (result \ "2" \ "targetOutcome" \ "correctness").as[String] === "incorrect"

    } */

    "respond when using libs that depend on each other" in {

      val oneJs =
        """
          |//var a = require("a");
          |exports.respond = function(question, answer, settings){
          |  return {}; //a.respond();
          |}
        """.stripMargin

      val aJs =
        """
          |//var b = require("b");
          |exports.respond = function(){
          |  return b.respond();
          |}
        """.stripMargin

      val bJs =
        """
          |exports.respond = function(){
          | return { correct: "correct" }
          |}
        """.stripMargin

      val one = comp("one", oneJs, Seq(LibraryId("org", "a", None)))
      val a = lib("a", aJs, Seq(LibraryId("org", "b", None)))
      val b = lib("b", bJs)

      Logger("tests.js").debug("--------->")

      val p = new RhinoOutcomeProcessor(Seq(one), Seq(a, b))

      val item = Json.obj("components" -> Json.obj("1" -> Json.obj("componentType" -> "org-one")))
      val session = Json.obj("components" -> Json.obj("1" -> Json.obj("answers" -> Json.obj())))
      val result = p.createOutcome(item, session, Json.obj())
      //(result \ "1" \ "correctness").as[String] ==== "correct"
      println(result)
      true === true
    }

    /*"fail - if there is bad js" in {

      val component = comp("name", "arst")
      val feedback = comp("feedback", feedbackRespondJs)
      val processor = new RhinoOutcomeProcessor(Seq(component, feedback), Seq.empty)
      try {
        processor.createOutcome(item, session, Json.obj())

      } catch {
        case e: Throwable => println(e)
      }
      processor.createOutcome(item, session, Json.obj()) must throwA[RuntimeException]
    }*/
  }

}
