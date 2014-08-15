package org.corespring.container.js.rhino

import org.corespring.container.components.model.Server
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.specs2.mutable.Specification
import play.api.libs.json.Json

class RhinoServerLogicTest extends Specification with ComponentMaker{


  val builder = new RhinoScopeBuilder(Seq(
    uiComp("test-comp", Seq.empty).copy(server = Server(
      """
        |exports.respond = function(question, answer, settings){
        |  return { correctness: 'correct' };
        |}
      """.stripMargin))
  ))

  val serverLogic = new RhinoServerLogic("org-test-comp", builder.scope)

  "server logic" should {
    "work" in {
      val result = serverLogic.createOutcome(Json.obj(), Json.obj(), Json.obj(), Json.obj())
      (result \ "correctness").as[String] === "correct"
    }
  }

}
