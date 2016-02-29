package org.corespring.container.client.pages

import org.corespring.container.client.component.{ ComponentJson, SingleComponentScriptBundle }
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.components.model.ComponentInfo
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.mockito.Matchers.{ eq => meq }
import org.specs2.execute.Result
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.{ Fragments, Scope }
import org.specs2.time.NoTimeConversions
import play.api.libs.json.Json

import scala.concurrent.{ Await, ExecutionContext, Future }

class ComponentEditorRendererTest
  extends Specification
  with Mockito
  with ComponentMaker
  with NoTimeConversions {

  object css {
    val src = Seq("src/one.css", "src/two.css")
    val dest = "dest.css"
  }

  object js {
    val ngModule = Seq("page-ng-module")
    val src = Seq("src/one.js", "src/two.js")
    val dest = "dest.js"
  }

  val versionInfo = Json.obj("version" -> 1)

  trait scope extends Scope {

    val containerExecutionContext = ContainerExecutionContext(ExecutionContext.global)

    val jade = {
      val m = mock[JadeEngine]
      m
    }

    val pageSourceService = {
      val m = mock[PageSourceService]
      m.loadJs(any[String]) returns NgSourcePaths(js.src, js.dest, Nil, js.ngModule)
      m.loadCss(any[String]) returns CssSourcePaths(css.src, css.dest, Nil)
      m
    }

    val componentJson = {
      val m = mock[ComponentJson]
      m.toJson(any[ComponentInfo]) returns Json.obj()
      m
    }

    val assetPathProcessor = {
      val m = mock[AssetPathProcessor]
      m.process(any[String]) answers { (s: Any) => s.asInstanceOf[String] }
      m
    }

    val renderer = new ComponentEditorRenderer(
      containerExecutionContext,
      jade,
      pageSourceService,
      componentJson,
      assetPathProcessor,
      versionInfo)
  }

  val component = {
    uiComp("my-comp", Nil)
  }

  def waitFor[A](f: Future[A]): A = {
    import scala.concurrent.duration._
    Await.result(f, 1.second)
  }

  "render" should {

    trait renderJade extends scope {

      def prodMode: Boolean = false
      val bundle = SingleComponentScriptBundle(component, Seq.empty, Seq("comp.css"), Seq("component-ng-module"))
      val clientOptions = ComponentEditorOptions.default
      lazy val captor = {
        waitFor(renderer.render(bundle, "tabs", clientOptions, prodMode))
        capture[Map[String, Any]]
      }
      there was one(jade).renderJade(meq("singleComponentEditor"), captor)
    }

    "call renderJade" in new renderJade {
      there was one(jade).renderJade(meq("singleComponentEditor"), captor)
    }

    trait jadeArgs extends renderJade {
    }

    def assertJadeParam(prodMode: Boolean = false)(key: String, assertFn: Option[Any] => Result): Fragments = {
      s"it calls $key ${if (prodMode) "- prod" else ""}" in new scope {
        val bundle = SingleComponentScriptBundle(component, Seq("comp.js"), Seq("comp.css"), Seq("component-ng-module"))
        val clientOptions = ComponentEditorOptions.default
        waitFor(renderer.render(bundle, "tabs", clientOptions, prodMode))
        lazy val captor = capture[Map[String, Any]]
        there was one(jade).renderJade(meq("singleComponentEditor"), captor)
        assertFn(captor.value.get(key))
      }
    }

    val devModeAssert = assertJadeParam(false) _
    devModeAssert("appName", v => v === Some("singleComponentEditor"))
    devModeAssert("previewMode", v => v must_== Some("tabs"))
    devModeAssert("previewWidth", v => v === Some(null))
    devModeAssert("ngModules", v => v === Some((js.ngModule :+ "component-ng-module").map(s => s"'$s'").mkString(",")))
    devModeAssert("options", v => v === Some(Json.stringify(ComponentEditorOptions.default.toJson)))
    devModeAssert("versionInfo", v => v === Some(Json.stringify(versionInfo)))
    devModeAssert("css", v => v.map(_.asInstanceOf[Array[Any]].toSeq) === Some(css.src :+ "comp.css"))
    assertJadeParam(true)("css", v => v.map(_.asInstanceOf[Array[Any]].toSeq) must_== Some(Seq(css.dest, "comp.css")))
    devModeAssert("js", v => v.map(_.asInstanceOf[Array[Any]].toSeq) === Some(js.src :+ "comp.js"))
    assertJadeParam(true)("js", v => v.map(_.asInstanceOf[Array[Any]].toSeq) must_== Some(Seq(js.dest, "comp.js")))
  }
}