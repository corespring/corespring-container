package org.corespring.container.client.controllers

import org.corespring.container.client.component.{ComponentMaker, SourceGenerator}
import org.corespring.container.components.model.Component
import org.specs2.mutable.Specification
import play.api.test.{FakeApplication, FakeRequest}
import play.api.test.Helpers._
import org.specs2.specification.Scope
import play.api.mvc.{Content, SimpleResult, Action, AnyContent}
import scala.concurrent.{Await, Future}
import java.nio.charset.Charset
import play.api.libs.iteratee.Iteratee
import play.libs.F.Promise

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
      contents === "editor - js - org-name"
    }.pendingUntilFixed("essential actions are returning null atm")

    "return data" in new resourceContext("player", "org[all]", "js") {
      contents === "player - js - org-name"
    }.pendingUntilFixed("essential actions aren't running")

    "return js urls" in {
      sets.jsUrl("editor", Seq(uiComp("org", "name", Seq.empty))) === org.corespring.container.client.controllers.routes.ComponentSets.resource("editor", "org[all]", "js").url
    }
    "return css urls" in {
      sets.cssUrl("player", Seq(uiComp("org", "name", Seq.empty))) === org.corespring.container.client.controllers.routes.ComponentSets.resource("player", "org[all]", "css").url
    }
  }

  class resourceContext(val context:String, val directive:String, val suffix:String) extends Scope{
    val result : SimpleResult = play.api.test.Helpers.await(sets.resource(context, directive, suffix)(FakeRequest("","")).run)

    lazy val contents = {
      val consume = Iteratee.consume[Array[Byte]]()
      val newIteratee: Future[Iteratee[Array[Byte], Array[Byte]]] = result.body(consume)
      val bytes : Iteratee[Array[Byte], Array[Byte]] = play.api.test.Helpers.await(newIteratee)//Await.ready(newIteratee)
      val b : Array[Byte] = play.api.test.Helpers.await(bytes.run)
      new String(b, "utf-8")
    }
  }
}

