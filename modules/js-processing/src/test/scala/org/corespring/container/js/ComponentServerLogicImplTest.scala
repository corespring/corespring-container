package org.corespring.container.js

import org.specs2.mutable.Specification
import play.api.libs.json.Json

class ComponentServerLogicImplTest extends Specification{

  val impl = new ComponentServerLogic {
    def js: String =
      """
        |exports.respond = function(question, answer, settings){
        | return { correctness: "correct"};
        |}
      """.stripMargin

    def componentLibs: Seq[(String, String)] = Seq.empty

    def componentType: String = "test-comp"
  }


  "server logic" should {
    "work" in {
      val result = impl.respond(Json.obj(), Json.obj(), Json.obj())
      (result \ "correctness").as[String] === "correct"
    }
  }

}
