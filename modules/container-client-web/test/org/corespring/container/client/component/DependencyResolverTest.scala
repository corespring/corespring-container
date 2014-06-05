package org.corespring.container.client.component

import org.corespring.container.components.model._
import org.specs2.mutable.Specification
import org.specs2.specification.Before

class DependencyResolverTest extends Specification with ComponentMaker {

  "components for types" should {

    "work" in new withResolver() {
      resolver.resolveComponents(Seq.empty, "player") === Seq.empty
    }

    "work for comps with no libs" in new withResolver(uiComp("ui-comp-1", Seq.empty)) {
      val out = resolver.resolveComponents(Seq(id("ui-comp-1")), "player")
      out.length === 1
    }

    "work for comps with 1 lib" in new withResolver(
      uiComp("ui-comp-1", Seq(libId("lib-1"))),
      lib("lib-1")) {
      val out = resolver.resolveComponents(Seq(id("ui-comp-1")), "player")
      out.length === 2
    }

    "comp -> lib-1 -> lib-2" in new withResolver(
      uiComp("ui-comp-1", Seq(libId("lib-1"))),
      lib("lib-1", Seq(libId("lib-2"))),
      lib("lib-2"),
      lib("lib-3"),
      lib("lib-4")) {
      val out = resolver.resolveComponents(Seq(id("ui-comp-1")), "player")
      out.length === 3
    }

    "topsort works" in new withResolver() {

      val libs = Seq(
        lib("1", Seq(libId("2"))),
        lib("2", Seq(libId("3"))),
        lib("3"))

      resolver.topSort(libs) === libs.reverse
    }

    "work with layout components" in new withResolver(
      uiComp("ui-comp-1", Seq(libId("lib-1"))),
      layout("layout-1")) {
      val out = resolver.resolveComponents(Seq(id("ui-comp-1"), id("layout-1")), "player")
      out.length === 2
    }

    "works with scoped libs" in new withResolver(
      uiComp("ui-comp1",
        Seq(
          libId("player-lib1", Some("player")),
          libId("server-lib1", Some("editor")))),
      lib("player-lib1"),
      lib("server-lib1")) {

      val playerComps = resolver.resolveComponents(Seq(id("ui-comp1")), "player")
      playerComps.length === 2
      playerComps.find(_.id.name == "player-lib1") must beSome[Component]

      val editorComps = resolver.resolveComponents(Seq(id("ui-comp1")), "editor")
      editorComps.length === 2
      editorComps.find(_.id.name == "server-lib1") must beSome[Component]
    }

  }

  class withResolver(comps: Component*) extends Before {

    val resolver = new DependencyResolver {
      override def components: Seq[Component] = comps
    }

    override def before: Any = {

    }
  }

}
