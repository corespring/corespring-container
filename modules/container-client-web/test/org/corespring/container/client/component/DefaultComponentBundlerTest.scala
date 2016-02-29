package org.corespring.container.client.component

import org.corespring.container.client.controllers.helpers.LoadClientSideDependencies
import org.corespring.container.components.model.{ Component, Id }
import org.corespring.container.components.model.dependencies.{ ComponentMaker, DependencyResolver }
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope

class DefaultComponentBundlerTest extends Specification with Mockito with ComponentMaker {

  val interaction = uiComp("type", Nil)

  trait scope extends Scope {

    val dependencyResolver = {
      val m = mock[DependencyResolver]
      m.components.returns {
        Seq(interaction)
      }

      m.resolveComponents(any[Seq[Id]], any[Option[String]]).returns {
        Seq(interaction)
      }
      m
    }

    val clientSideDependencies = {
      val m = mock[LoadClientSideDependencies]
      m.getClientSideDependencies(any[Seq[Component]]).returns {
        Seq.empty
      }
      m
    }

    val urls = {
      val m = mock[ComponentUrls]
      m.jsUrl(any[String], any[Seq[Component]], any[Boolean]).returns {
        Seq("jsUrl")
      }
      m.cssUrl(any[String], any[Seq[Component]], any[Boolean]).returns {
        Seq("cssUrl")
      }
      m
    }
    val componentService = {
      val m = mock[ComponentService]
      m
    }

    val bundler = new DefaultComponentBundler(
      dependencyResolver,
      clientSideDependencies,
      urls,
      componentService)
  }

  "singleBundle" should {

    trait singleBundle extends scope {
      val bundle = bundler.singleBundle(interaction.componentType, "editor", false)
    }

    "build a SingleScriptBundler" in new singleBundle {
      bundle must_== Some(
        SingleComponentScriptBundle(
          interaction,
          Seq("jsUrl"),
          Seq("cssUrl"),
          Seq("org.type")))
    }

    "call urls.jsUrl" in new singleBundle {
      there was one(urls).jsUrl("editor", Seq(interaction), false)
    }

    "call urls.cssUrl" in new singleBundle {
      there was one(urls).cssUrl("editor", Seq(interaction), false)
    }

    "call dependencyResolver.resolveComponents" in new singleBundle {
      there was one(dependencyResolver).resolveComponents(Seq(interaction.id), Some("editor"))
    }

    "call clientSideDependencies.getClientSideDependencies" in new singleBundle {
      there was one(clientSideDependencies).getClientSideDependencies(Seq(interaction))
    }
  }
}
