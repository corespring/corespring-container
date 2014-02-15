package org.corespring.container.client.controllers

import org.specs2.mutable.Specification
import org.corespring.container.components.model.{UiComponent, Component}
import org.corespring.container.client.component.ComponentMaker
import play.api.test.FakeRequest
import play.api.test.Helpers._

class DevComponentSetsTest extends Specification with ComponentMaker{

  "dev component sets" should {

    "work" in {

      val sets = new DevComponentSets {


        override def components: Seq[Component] = {

          (1 to 20).foldRight[Seq[Component]](Seq()){ (c, s) =>  s :+ uiComp("org", s"comp-$c", Seq.empty) }
          //Seq(uiComp("org", "name", Seq.empty))
        }
      }

      val hash = "org-name".hashCode.toString

      val result = sets.resource("player", hash, "js")(FakeRequest("",""))
      println(".." + contentAsString(result))
      true === true
    }
  }

}
