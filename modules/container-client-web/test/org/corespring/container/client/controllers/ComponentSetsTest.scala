package org.corespring.container.client.controllers

import org.corespring.container.client.component.{ComponentMaker, SourceGenerator}
import org.corespring.container.components.model.Component
import org.specs2.mutable.Specification
import play.api.test.{WithApplication, FakeApplication, FakeRequest}
import play.api.test.Helpers._
import org.specs2.specification.Scope
import play.api.mvc.{Content, SimpleResult, Action, AnyContent}
import scala.concurrent.{Await, Future}
import java.nio.charset.Charset
import play.api.libs.iteratee.Iteratee
import play.libs.F.Promise
import play.api.GlobalSettings

class ComponentSetsTest extends Specification with ComponentMaker {

  sequential

  class MockSourceGenerator(name: String) extends SourceGenerator {
    override def css(components: Seq[Component]): String = s"$name - css - ${components.map(_.componentType).mkString(",")}"

    override def js(components: Seq[Component]): String = s"$name - js - ${components.map(_.componentType).mkString(",")}"
  }

  val sets = new ComponentSets {

    override def playerGenerator: SourceGenerator = new MockSourceGenerator("player")

    override def editorGenerator: SourceGenerator = new MockSourceGenerator("editor")

    override def allComponents: Seq[Component] = Seq(uiComp("org", "name", Seq.empty))
  }

  object mockGlobal extends GlobalSettings

  "component sets" should {

    //Note: When running against essential action we need to
    //be running a Play app so a thread pool is available.
    //@see: https://github.com/playframework/playframework/issues/2011

    "return data" in running(FakeApplication(
      withGlobal = Some(mockGlobal)
    )) {

      val result: Future[SimpleResult] = sets.resource("editor", "org[all]", "js")(FakeRequest("", "")).run
      contentAsString(result) === "editor - js - org-name"
    }

    "return data" in running(FakeApplication(withGlobal = Some(mockGlobal))) {
      val result: Future[SimpleResult] = sets.resource("player", "org[all]", "js")(FakeRequest("", "")).run
      contentAsString(result) === "player - js - org-name"
    }

    "return js urls" in {
      sets.jsUrl("editor", Seq(uiComp("org", "name", Seq.empty))) === org.corespring.container.client.controllers.routes.ComponentSets.resource("editor", "org[all]", "js").url
    }

    "return css urls" in {
      sets.cssUrl("player", Seq(uiComp("org", "name", Seq.empty))) === org.corespring.container.client.controllers.routes.ComponentSets.resource("player", "org[all]", "css").url
    }
  }

}

