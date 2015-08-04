package org.corespring.container.client.controllers

import org.corespring.container.client.component.SourceGenerator
import org.corespring.container.components.model.{ Library, Component }
import org.corespring.container.components.model.dependencies.{ DependencyResolver, ComponentMaker }
import org.specs2.mutable.Specification
import play.api.GlobalSettings
import play.api.libs.json.{ Json, JsObject }
import play.api.mvc.{ Action, EssentialAction, SimpleResult }
import play.api.test.Helpers._
import play.api.test.{ FakeApplication, FakeRequest }
import scala.concurrent.Future

class ComponentSetsTest extends Specification with ComponentMaker {

  sequential

  class MockSourceGenerator(name: String) extends SourceGenerator {
    override def css(components: Seq[Component]): String = s"$name - css - ${components.map(_.componentType).mkString(",")}"

    override def less(components: Seq[Component], customColors: JsObject): String = s"$name - less - ${components.map(_.componentType).mkString(",")}"

    override def js(components: Seq[Component]): String = s"$name - js - ${components.map(_.componentType).mkString(",")}"

    override protected def libraryToJs(l: Library): String = "libaryToJs"
  }

  val sets = new ComponentSets {

    override def playerGenerator: SourceGenerator = new MockSourceGenerator("player")

    override def editorGenerator: SourceGenerator = new MockSourceGenerator("editor")

    override def catalogGenerator: SourceGenerator = new MockSourceGenerator("catalog")

    override def allComponents: Seq[Component] = Seq(uiComp("name", Seq.empty))

    override def dependencyResolver: DependencyResolver = new DependencyResolver {
      override def components: Seq[Component] = allComponents
    }

    override def resource[A >: EssentialAction](context: String, directive: String, suffix: String): A = Action {
      val (body, ct) = generateBodyAndContentType(context, directive, suffix)
      Ok(body).as(ct)
    }

    override def singleResource[A >: EssentialAction](context: String, componentType: String, suffix: String): A = Action {
      val (body, ct) = generate(context, Seq.empty, suffix)
      Ok(body).as(ct)
    }
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
      sets.jsUrl("editor", Seq(uiComp("name", Seq.empty)), false) === Seq(org.corespring.container.client.controllers.routes.ComponentSets.resource("editor", "org[all]", "js").url)
    }

    "return js urls as a single resource" in {
      sets.jsUrl("editor", Seq(uiComp("name", Seq.empty)), true) === Seq(org.corespring.container.client.controllers.routes.ComponentSets.singleResource("editor", "org-name", "js").url)
    }

    "return js urls" in {
      sets.jsUrl("editor", Seq(uiComp("name", Seq.empty)), false) === Seq(org.corespring.container.client.controllers.routes.ComponentSets.resource("editor", "org[all]", "js").url)
    }

    "return css urls" in {
      sets.cssUrl("player", Seq(uiComp("name", Seq.empty)), false) === Seq(org.corespring.container.client.controllers.routes.ComponentSets.resource("player", "org[all]", "css").url)
    }

    "return less urls" in {
      sets.lessUrl("player", Seq(uiComp("name", Seq.empty)), false, None) === Seq(org.corespring.container.client.controllers.routes.ComponentSets.resource("player", "org[all]", "less").url)
    }

    "returns no url if no comps" in {
      sets.jsUrl("editor", Seq.empty, false) === Seq.empty
    }

    "returns no url if no comps" in {
      sets.cssUrl("editor", Seq.empty, false) === Seq.empty
    }
  }

}

