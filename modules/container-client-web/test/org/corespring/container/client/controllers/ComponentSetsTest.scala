package org.corespring.container.client.controllers

import org.corespring.container.client.component.SourceGenerator
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.specs2.mutable.Specification
import play.api.GlobalSettings
import play.api.mvc.SimpleResult
import play.api.test.Helpers._
import play.api.test.{ FakeApplication, FakeRequest }
import scala.concurrent.Future

class ComponentSetsTest extends Specification with ComponentMaker {

  sequential

  class MockSourceGenerator(name: String) extends SourceGenerator {
    override def css(components: Seq[Component]): String = s"$name - css - ${components.map(_.componentType).mkString(",")}"

    override def js(components: Seq[Component]): String = s"$name - js - ${components.map(_.componentType).mkString(",")}"
  }

  val sets = new ComponentSets {

    override def playerGenerator: SourceGenerator = new MockSourceGenerator("player")

    override def editorGenerator: SourceGenerator = new MockSourceGenerator("editor")

    override def catalogGenerator: SourceGenerator = new MockSourceGenerator("catalog")

    override def allComponents: Seq[Component] = Seq(uiComp("name", Seq.empty))
  }

  object mockGlobal extends GlobalSettings

  "component sets" should {

    //Note: When running against essential action we need to
    //be running a Play app so a thread pool is available.
    //@see: https://github.com/playframework/playframework/issues/2011

    "return data" in running(FakeApplication(
      withGlobal = Some(mockGlobal))) {

      val result: Future[SimpleResult] = sets.resource("editor", "org[all]", "js")(FakeRequest("", "")).run
      contentAsString(result) === "editor - js - org-name"
    }

    "return data" in running(FakeApplication(withGlobal = Some(mockGlobal))) {
      val result: Future[SimpleResult] = sets.resource("player", "org[all]", "js")(FakeRequest("", "")).run
      contentAsString(result) === "player - js - org-name"
    }

    "return js urls" in {
      sets.jsUrl("editor", Seq(uiComp("name", Seq.empty))) === org.corespring.container.client.controllers.routes.ComponentSets.resource("editor", "org[all]", "js").url
    }

    "return css urls" in {
      sets.cssUrl("player", Seq(uiComp("name", Seq.empty))) === org.corespring.container.client.controllers.routes.ComponentSets.resource("player", "org[all]", "css").url
    }
  }

}

