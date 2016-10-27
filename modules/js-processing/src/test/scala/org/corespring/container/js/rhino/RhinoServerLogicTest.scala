package org.corespring.container.js.rhino

import org.corespring.container.components.model.{Component, Server}
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.corespring.container.components.services.{ComponentService, DependencyResolver}
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.Json._

class RhinoServerLogicTest extends Specification with ComponentMaker {


  val basic = """
      |exports.createOutcome = function(question, answer, settings){
      |  return { correctness: 'correct' };
      |}
      |
    """.stripMargin

  case class scope(jsSrc:String) extends Scope{

    val service = new ComponentService {
      override def components: Seq[Component] = Seq(
        uiComp("test-comp", Seq.empty).copy(server = Server(jsSrc))
      )
    }

    val dependencyResolver = new DependencyResolver(service)
    val builder = new RhinoScopeBuilder(dependencyResolver, service.components)

    val serverLogic = new RhinoServerLogic("org-test-comp", builder.scope)
  }

  "createOutcome" should {
    "return correctness" in new scope(basic){
      val result = serverLogic.createOutcome(obj(), obj(), obj(), obj())
      (result \ "correctness").as[String] === "correct"
    }
  }

  "isScoreable" should {

    def scoreable(result:Boolean = false) =
      s"""
        |exports.isScoreable = function(question, response, outcome){
        |  return ${result};
        |}
      """.stripMargin

    "return false if isScoreable is defined in the js and returns false" in new scope(scoreable()){
      serverLogic.isScoreable(obj(), obj(), obj()) must_== false
    }

    "return true if isScoreable is defined in the js and returns true" in new scope(scoreable(true)){
      serverLogic.isScoreable(obj(), obj(), obj()) must_== true
    }
    "return true if isScoreable is not defined" in new scope(""){
      serverLogic.isScoreable(obj(), obj(), obj()) must_== true
    }
  }

}
