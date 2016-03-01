package org.corespring.container.js.rhino

import org.corespring.container.components.model.{Component, Server}
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.corespring.container.components.services.{ComponentService, DependencyResolver}
import org.specs2.mutable.Specification
import play.api.libs.json.Json

class RhinoServerLogicTest extends Specification with ComponentMaker {

  val service = new ComponentService {
    override def components: Seq[Component] = Seq(
      uiComp("test-comp", Seq.empty).copy(server = Server(
        """
          |exports.createOutcome = function(question, answer, settings){
          |  return { correctness: 'correct' };
          |}
        """.stripMargin)))
  }

  val dependencyResolver = new DependencyResolver(service)
  val builder = new RhinoScopeBuilder(dependencyResolver, service.components)

  val serverLogic = new RhinoServerLogic("org-test-comp", builder.scope)

  "server logic" should {
    "return correctness" in {
      val result = serverLogic.createOutcome(Json.obj(), Json.obj(), Json.obj(), Json.obj())
      (result \ "correctness").as[String] === "correct"
    }
  }

}
