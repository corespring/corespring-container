package org.corespring.container.js.rhino

import org.corespring.container.components.model._
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.corespring.container.components.services.{ComponentService, DependencyResolver}
import org.corespring.container.js.response.Target
import org.specs2.mutable.Specification
import play.api.libs.json.{JsString, Json}

class OutcomeProcessorTest extends Specification with ComponentMaker {

  val interactionRespondJs =
    """
      |exports.createOutcome = function(question, answer, settings){
      |
      |  if(!answer){
      |    return { correctness: 'incorrect', score: 0 }
      |  }
      |  var correct = question.correctResponse.value == answer.value;
      |  return { correctness: correct ? "correct" : "incorrect", answer : answer };
      |}
    """.stripMargin

  val feedbackRespondJs =
    """
      |exports.createOutcome = function(question, answer, settings, targetOutcome){
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

  def interaction(name: String = "name", serverJs: String, libraries: Seq[Id] = Seq.empty) =
    uiComp(name, libraries).copy(server = Server(serverJs))

  def customLib(name: String = "name", libJs: String, deps: Seq[Id] = Seq.empty) =
    lib(name, deps).copy(server = Seq(LibrarySource(name, libJs)))

  "Target" should {
    "work" in {
      val t = new Target {}
      t.hasTarget(Json.obj("target" -> Json.obj("id" -> JsString("1")))) === true
      t.hasTarget(Json.obj("target" -> Json.obj("otherId" -> JsString("1")))) === false
      t.hasTarget(Json.obj()) === false
    }
  }

  def mkService(comps : Component*) = new ComponentService {
    override def components: Seq[Component] = comps //Seq(comps : _*)
  }

  "OutcomeProcessor" should {
    "respond" in {

      val component = interaction("name", interactionRespondJs)
      val feedback = interaction("feedback", feedbackRespondJs)
      val service = mkService(component, feedback)
      val resolver = new DependencyResolver(service)
      val builder = new RhinoScopeBuilder(resolver, service.components)
      val processor = new RhinoOutcomeProcessor(Seq(component, feedback), builder.scope)
      val result = processor.createOutcome(item, session, Json.obj())
      (result \ "1" \ "correctness").as[String] === "incorrect"
      (result \ "2" \ "targetOutcome" \ "correctness").as[String] === "incorrect"
    }

    "return an incorrect response if the answer is empty" in {

      val component = interaction("name", interactionRespondJs)
      val service = mkService(component)
      val resolver = new DependencyResolver(service)
      val builder = new RhinoScopeBuilder(resolver, service.components)
      val processor = new RhinoOutcomeProcessor(Seq(component), builder.scope)

      val item = Json.obj(
        "components" -> Json.obj(
          "1" -> Json.obj(
            "componentType" ->
              "org-name",
            "correctResponse" -> Json.obj(
              "value" -> "1"))))

      val session = Json.obj("components" -> Json.obj())
      val result = processor.createOutcome(item, session, Json.obj())
      (result \ "1" \ "correctness").as[String] === "incorrect"
    }

    /**
     * This asserts that library js is loaded in the correct order so that it can be executed correctly.
     */
    "Respond when using libs that depend on each other." in {

      val oneJs =
        """
          |var a = require("a");
          |exports.createOutcome = function(question, answer, settings){
          |  return {
          |    a: a.createOutcome(),
          |    oneJs: "hi from oneJs"
          |  }
          |}
        """.stripMargin

      val aJs =
        """
          |var b = require("b");
          |exports.createOutcome = function(){
          |  return {
          |    b: b.createOutcome(),
          |    a: "hi from a"
          |  }
          |}
        """.stripMargin

      val bJs =
        """
          |var c = require("c");
          |exports.createOutcome = function(){
          | return { b:  "hi from b", c: c.createOutcome() }
          |}
        """.stripMargin

      val cJs =
        """
          |exports.createOutcome = function(){
          | return { c : "hi from c" };
          |}
        """.stripMargin
      val one = interaction("one", oneJs, Seq(Id("org", "a", None)))
      val a = customLib("a", aJs, Seq(Id("org", "b", None)))
      val b = customLib("b", bJs, Seq(Id("org", "c", None)))
      val c = customLib("c", cJs, Seq.empty)

      val service = mkService(one, a, b, c)
      val resolver = new DependencyResolver(service)
      val builder = new RhinoScopeBuilder(resolver, service.components)
      val p = new RhinoOutcomeProcessor(service.components, builder.scope)

      val item = Json.obj("components" -> Json.obj("1" -> Json.obj("componentType" -> "org-one")))
      val session = Json.obj("components" -> Json.obj("1" -> Json.obj("answers" -> Json.obj())))
      val result = p.createOutcome(item, session, Json.obj())
      println(result)
      result === Json.parse("""{"1":{"a":{"b":{"b":"hi from b","c":{"c":"hi from c"}},"a":"hi from a"},"oneJs":"hi from oneJs","studentResponse":{}}}""")
    }

    "fail - if there is bad js" in {
      val component = interaction("name", "arst")
      val feedback = interaction("feedback", feedbackRespondJs)
      val service = mkService(component, feedback)
      val resolver = new DependencyResolver(service)
      val builder = new RhinoScopeBuilder(resolver, service.components)
      builder.scope must throwA[RuntimeException]
    }
  }

  "new processor" should {
    lazy val library = lib("lib").copy(server = Seq(LibrarySource("src-1",
      """
        |exports.ping = function(){
        |  return "pong";
        |}
      """.stripMargin)))
    lazy val interaction = uiComp("interaction", Seq(Id("org", "lib"))).copy(server = Server(
      """
        |var l = require('src-1');
        |exports.createOutcome = function(){
        |  return { msg: l.ping() }
        |}
      """.stripMargin))

    lazy val service = mkService(interaction, library)
    lazy val resolver = new DependencyResolver(service)
    lazy val builder = new RhinoScopeBuilder(resolver, service.components)
    lazy val processor = new RhinoOutcomeProcessor(service.components, builder.scope)
    "execute js" in {
      val item = Json.obj("components" -> Json.obj(
        "1" -> Json.obj(
          "componentType" -> "org-interaction")))
      val session = Json.obj("components" -> Json.obj(
        "1" -> Json.obj(
          "answers" -> "a")))
      val settings = Json.obj()
      processor.createOutcome(item, session, settings) === Json.obj(
        "1" -> Json.obj(
          "msg" -> "pong",
          "studentResponse" -> "a"))
    }
  }

}
