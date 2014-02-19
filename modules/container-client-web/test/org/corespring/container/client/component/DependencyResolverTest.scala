package org.corespring.container.client.component

import org.corespring.container.components.model._
import org.specs2.mutable.Specification
import org.specs2.specification.Before

class DependencyResolverTest extends Specification with ComponentMaker{

  "components for types" should {

    "work" in new withResolver() {
      resolver.resolveComponents(Seq.empty, "player") === Seq.empty
    }

    "work for comps with no libs" in new withResolver(uiComp("org", "ui-comp-1", Seq.empty)) {
      val out = resolver.resolveComponents(Seq(id("org", "ui-comp-1")), "player")
      out.length === 1
    }

    "work for comps with 1 lib" in new withResolver(
      uiComp("org", "ui-comp-1", Seq(libId("org", "lib-1"))),
      lib("org", "lib-1")
    ) {
      val out = resolver.resolveComponents(Seq(id("org", "ui-comp-1")), "player")
      out.length === 2
    }

    "work with layout components" in new withResolver(
      uiComp("org", "ui-comp-1", Seq(libId("org", "lib-1"))),
      layout("org", "layout-1")
    ) {
      val out = resolver.resolveComponents(Seq(id("org", "ui-comp-1"), id("org", "layout-1")), "player")
      out.length === 2
    }

    "works with scoped libs" in new withResolver(
      uiComp("org", "ui-comp1",
        Seq(
          libId("org", "player-lib1", Some("player")),
          libId("org", "server-lib1", Some("editor"))
        )),
      lib("org", "player-lib1"),
      lib("org", "server-lib1")
    ) {

      val playerComps = resolver.resolveComponents(Seq(id("org", "ui-comp1")), "player")
      playerComps.length === 2
      playerComps.find(_.id.name == "player-lib1") must beSome[Component]

      val editorComps = resolver.resolveComponents(Seq(id("org", "ui-comp1")), "editor")
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
