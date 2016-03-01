package org.corespring.container.components.services

import org.corespring.container.components.model._
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.specs2.mutable.Specification
import org.specs2.specification.Scope

class DependencyResolverTest extends Specification with ComponentMaker {

  private def mkService(components:Seq[Component]) =  new ComponentService {
    override def components: Seq[Component] = components
  }


  class withResolver(comps: Component*) extends Scope {
    val resolver = new DependencyResolver(mkService(comps))
  }

  "components for types" should {

    val comps = Seq(
      uiComp("ui-comp-1", Seq(id("lib-1", scope = Some("editor")))),
      uiComp("ui-comp-2", Seq(id("lib-3"))),
      uiComp("ui-comp-3", Seq(id("lib-3"), id("lib-5"))),
      layout("layout-1"),
      lib("lib-1", Seq(id("lib-2"))),
      lib("lib-2", Seq(id("lib-3", scope = Some("player")))),
      lib("lib-3"),
      lib("lib-4"),
      lib("lib-5", Seq(id("lib-6"))),
      lib("lib-6", Seq(id("lib-7"))),
      lib("lib-7"))

    "simple" in {

      val one = uiComp("one", Seq(id("a")))
      val a = lib("a", Seq(id("b")))
      val b = lib("b")

      val r = new DependencyResolver(mkService(Seq(one, a, b)))

      r.resolveComponents(Seq(id("one"))) === Seq(b, a, one)
      r.resolveComponents(Seq(id("a"))) === Seq(b, a)
    }

    "handles cyclical relationships" in {
      val one = uiComp("one", Seq(id("a")))
      val a = lib("a", Seq(id("b")))
      val b = lib("b", Seq(id("a")))

      val r = new DependencyResolver(mkService(Seq(one, a, b)))

      r.resolveComponents(Seq(id("one"))) must throwA[RuntimeException]
    }

    "empty seq returns empty" in new withResolver(comps: _*) {
      resolver.resolveIds(Seq.empty) === Seq.empty
    }

    "scope is applied" in new withResolver(comps: _*) {
      val result = resolver.resolveIds(Seq(id("ui-comp-1")), Some("scope"))
      result === Seq(id("ui-comp-1"))
    }

    "scope is applied - when nested" in new withResolver(comps: _*) {
      val result = resolver.resolveIds(Seq(id("ui-comp-1")), Some("editor"))
      result === Seq(
        id("lib-2"),
        id("lib-1"),
        id("ui-comp-1"))
    }

    "resolve ids" in new withResolver(comps: _*) {
      val result = resolver.resolveIds(Seq(id("ui-comp-1")))
      result === Seq(
        id("lib-3"),
        id("lib-2"),
        id("lib-1"),
        id("ui-comp-1"))
    }
    "layouts are added" in new withResolver(comps: _*) {
      val result = resolver.resolveIds(Seq(id("layout-1")))
      result === Seq(id("layout-1"))
    }

    "resolve ids - 2" in new withResolver(comps: _*) {
      val result = resolver.resolveIds(Seq(id("ui-comp-2")))
      result === Seq(
        id("lib-3"),
        id("ui-comp-2"))
    }

    "resolve ids - 3" in new withResolver(comps: _*) {
      val result = resolver.resolveIds(Seq(id("ui-comp-3")))
      result === Seq(
        id("lib-7"),
        id("lib-3"),
        id("lib-6"),
        id("lib-5"),
        id("ui-comp-3"))
    }

    "resolve multiple" in new withResolver(comps: _*) {
      val result = resolver.resolveIds(Seq(id("ui-comp-1"), id("ui-comp-2")))
      result === Seq(
        id("lib-3"),
        id("lib-2"),
        id("ui-comp-2"),
        id("lib-1"),
        id("ui-comp-1"))
    }

    "resolve multiple - 2" in new withResolver(comps: _*) {
      val result = resolver.resolveIds(Seq(id("ui-comp-1"), id("ui-comp-2"), id("ui-comp-3")))
      result === Seq(
        id("lib-7"),
        id("lib-3"),
        id("lib-6"),
        id("lib-2"),
        id("ui-comp-2"),
        id("lib-5"),
        id("lib-1"),
        id("ui-comp-3"),
        id("ui-comp-1"))
    }

    "layouts are added" in new withResolver(comps: _*) {
      val result = resolver.resolveIds(Seq(id("layout-1")))
      result === Seq(id("layout-1"))
    }

    "layouts are added with ui comp" in new withResolver(comps: _*) {
      val result = resolver.resolveIds(Seq(id("ui-comp-1"), id("layout-1")))
      result === Seq(
        id("lib-3"),
        id("layout-1"),
        id("lib-2"),
        id("lib-1"),
        id("ui-comp-1"))
    }

  }
}
