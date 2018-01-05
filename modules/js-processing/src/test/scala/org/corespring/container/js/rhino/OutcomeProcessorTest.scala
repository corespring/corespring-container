package org.corespring.container.js.rhino

import org.corespring.container.components.model._
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.corespring.container.components.services.{ComponentService, DependencyResolver}
import org.corespring.container.js.response.{OutcomeProcessor, Target}
import org.slf4j.LoggerFactory
import org.specs2.mutable.Specification
import play.api.libs.json.{JsString, Json}
import play.api.libs.json.Json.{obj, prettyPrint}


class OutcomeProcessorTest extends Specification with ComponentMaker {

  private val logger = LoggerFactory.getLogger(this.getClass)
  def getProcessor(service:ComponentService) = {
    val resolver = new DependencyResolver(service)
    val builder = new RhinoScopeBuilder(resolver, service.components)
    new RhinoOutcomeProcessor(service.components, builder.scope)
  }

  val interactionRespondJs =
    """
      |exports.createOutcome = function(question, answer, settings){
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

  val item = obj(
    "components" -> obj(
      "1" -> obj(
        "componentType" -> "org-name",
        "correctResponse" -> obj(
          "value" -> "1")),
      "2" -> obj(
        "componentType" -> "org-feedback",
        "target" -> obj(
          "id" -> "1"))))

  val session = obj(
    "components" -> obj(
      "1" -> obj(
        "answers" -> obj("value" -> "2"),
        "stash" -> obj())))

  def interaction(name: String = "name", serverJs: String, libraries: Seq[Id] = Seq.empty) =
    uiComp(name, libraries).copy(server = Server(serverJs))

  def customLib(name: String = "name", libJs: String, deps: Seq[Id] = Seq.empty) =
    lib(name, deps).copy(server = Seq(LibrarySource(name, libJs)))

  "Target" should {
    "work" in {
      val t = new Target {}
      t.hasTarget(obj("target" -> obj("id" -> "1"))) === true
      t.hasTarget(obj("target" -> obj("otherId" -> "1"))) === false
      t.hasTarget(obj()) === false
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
      val processor = getProcessor(service)
      val result = processor.createOutcome(item, session, obj())
      logger.info(s"result: ${Json.prettyPrint(result)}")
      (result \ "1" \ "correctness").as[String] === "incorrect"
      (result \ "2" \ "targetOutcome" \ "correctness").as[String] === "incorrect"
    }

    "return an incorrect response if the answer is empty" in {

      val component = interaction("name", interactionRespondJs)
      val service = mkService(component)
      val processor = getProcessor(service)

      val item = obj(
        "components" -> obj(
          "1" -> obj(
            "componentType" ->
              "org-name",
            "correctResponse" -> obj(
              "value" -> "1"))))

      val session = obj("components" -> obj())
      val result = processor.createOutcome(item, session, obj())
      (result \ "1" \ "correctness").as[String] === "unknown"
      (result \ "1" \ "error").as[String] === processor.missingAnswer("1")
    }

    def config = obj(
      "componentType" -> "org-name",
      "correctResponse" -> obj( "value" -> "1"))
    "return mixed responses if some of the answers are missing" in {

      val component = interaction("name", interactionRespondJs)
      val service = mkService(component)
      val processor = getProcessor(service)

      val item = obj( "components" -> obj( "1" -> config, "2" -> config ))

      val session = obj("components" -> obj("2" -> obj("answers" -> obj("value" -> "1"))))
      val result = processor.createOutcome(item, session, obj())
      logger.info(s"result: ${prettyPrint(result)}")
      (result \ "1" \ "correctness").as[String] === "unknown"
      (result \ "1" \ "error").as[String] === processor.missingAnswer("1")
      (result \ "2" \ "correctness").as[String] === "correct"
    }

    "return an unknown correctness if the underlying js fails" in {
      val component = interaction("name", "exports.createOutcome = function(){ return blah;} ")
      val service = mkService(component)
      val processor = getProcessor(service)

      val item = obj( "components" -> obj( "1" -> config))

      val session = obj("components" -> obj("1" -> obj("answers" -> obj("value" -> "1"))))
      val result = processor.createOutcome(item, session, obj())
      logger.info(s"result: ${prettyPrint(result)}")
      (result \ "1" \ "error").as[String].contains("ReferenceError") === true

    }

    "return no answer response for missing answers" in {

      val component = interaction("name", interactionRespondJs)
      val service = mkService(component)
      val processor = getProcessor(service)
      val item = obj( "components" -> obj( "1" -> config))

      val session = obj()
      val result = processor.createOutcome(item, session, obj())
      logger.info(s"result: ${prettyPrint(result)}")
      result === obj("1" -> processor.noAnswerOutcome(processor.missingAnswer("1")))
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
      val p = getProcessor(service)

      val item = obj("components" -> obj("1" -> obj("componentType" -> "org-one")))
      val session = obj("components" -> obj("1" -> obj("answers" -> obj())))
      val result = p.createOutcome(item, session, obj())
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
    lazy val processor = getProcessor(service)

    "execute js" in {
      val item = obj("components" -> obj(
        "1" -> obj(
          "componentType" -> "org-interaction")))
      val session = obj("components" -> obj(
        "1" -> obj(
          "answers" -> "a")))
      val settings = obj()
      processor.createOutcome(item, session, settings) === obj(
        "1" -> obj(
          "msg" -> "pong",
          "studentResponse" -> "a"))
    }

  }
}
