package org.corespring.container.client.controllers

import org.corespring.container.client.component.{ComponentMaker, SourceGenerator}
import org.corespring.container.components.model.Component
import org.specs2.mutable.Specification
import play.api.test.FakeRequest
import play.api.test.Helpers._
import org.specs2.specification.Scope

class ComponentSetsTest extends Specification with ComponentMaker{


  class MockSourceGenerator(name:String) extends SourceGenerator{
    override def css(components: Seq[Component]): String = s"$name - css - ${components.map(_.componentType).mkString(",")}"

    override def js(components: Seq[Component]): String = s"$name - js - ${components.map(_.componentType).mkString(",")}"
  }

  val sets = new ComponentSets {

    override def playerGenerator: SourceGenerator = new MockSourceGenerator("player")

    override def editorGenerator: SourceGenerator = new MockSourceGenerator("editor")

    override def allComponents: Seq[Component] = Seq(uiComp("org", "name", Seq.empty))
  }

  "component sets" should {

    "return data" in new resourceContext("editor", "org[all]", "js") {
      contentAsString(result) === "editor - js - org-name"
    }

    "return data" in new resourceContext("player", "org[all]", "js") {
      contentAsString(result) === "player - js - org-name"
    }

    "return js urls" in {
      sets.jsUrl("editor", Seq(uiComp("org", "name", Seq.empty))) === org.corespring.container.client.controllers.routes.ComponentSets.resource("editor", "org[all]", "js").url
    }
    "return css urls" in {
      sets.cssUrl("player", Seq(uiComp("org", "name", Seq.empty))) === org.corespring.container.client.controllers.routes.ComponentSets.resource("player", "org[all]", "css").url
    }
  }

  class resourceContext(val context:String, val directive:String, val suffix:String) extends Scope{
    val result = sets.resource(context, directive, suffix)(FakeRequest("",""))
  }
}

