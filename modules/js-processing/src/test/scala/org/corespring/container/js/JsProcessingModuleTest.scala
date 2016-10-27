package org.corespring.container.js

import org.corespring.container.components.model.dependencies.ComponentMaker
import org.corespring.container.components.model.{Component, Server}
import org.corespring.container.components.services.{ComponentService, DependencyResolver}
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.Json._

class JsProcessingModuleTest extends Specification {

  trait scope extends Scope with JsProcessingModule with ComponentMaker{

    def jsSrc =
      """
        |exports.isScoreable = function(){
        |  return false;
        |}
      """.stripMargin
    override val jsProcessingConfig: JsProcessingConfig =  JsProcessingConfig(reloadScope = false)

    val componentService = new ComponentService {
      override def components: Seq[Component] = scope.this.components
    }

    override val dependencyResolver: DependencyResolver = new DependencyResolver(componentService)

    override def components: Seq[Component] = Seq(
      uiComp("test-comp", Seq.empty).copy(server = Server(jsSrc))
    )


  }

  //PE-519
  "mainScoreProcessor" should  {
    "return isScoreable false" in new scope {

      val result = mainScoreProcessor.isComponentScoreable("org-test-comp", obj(
        "components" -> obj(
          "1" -> obj("componentType" -> "org-test-comp")
        )
      ), obj(), obj())
      result must_== false
    }
  }
}
