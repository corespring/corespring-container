package org.corespring.container.client.controllers.apps.componentEditor

import org.corespring.container.client.component.{ SingleComponentScriptBundle, ComponentBundler }
import org.corespring.container.client.controllers.apps.ComponentEditorOptions
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.ComponentEditorRenderer
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import org.specs2.time.NoTimeConversions
import play.api.Mode
import play.api.Mode.Mode
import play.api.templates.Html
import play.api.test.FakeRequest
import org.mockito.Matchers.{ eq => m_eq }

import scala.concurrent.duration._
import scala.concurrent.{ Await, ExecutionContext, Future }

class ComponentEditorLaunchingControllerTest extends Specification with Mockito with NoTimeConversions
  with ComponentMaker {

  trait scope extends Scope {
    def req = FakeRequest("", "").withFormUrlEncodedBody("previewMode" -> "tabs")
    def wait[A](f: Future[A]): A = Await.result(f, 1.second)
    def mode: Mode = Mode.Dev

    val bundler = {
      val m = mock[ComponentBundler]
      m.singleBundle(any[String], any[String], any[Boolean]) returns Some(
        SingleComponentScriptBundle(
          uiComp("type", Nil),
          Nil,
          Nil,
          Nil))
      m
    }

    val renderer = {
      val m = mock[ComponentEditorRenderer]
      m.render(any[SingleComponentScriptBundle], any[String], any[ComponentEditorOptions], any[Boolean]) returns {
        Future.successful(Html("<html></html>"))
      }
      m
    }

    val controller = new ComponentEditorLaunchingController {
      override def renderer: ComponentEditorRenderer = scope.this.renderer

      override def mode: Mode = scope.this.mode

      override def bundler: ComponentBundler = scope.this.bundler

      override def containerContext: ContainerExecutionContext = ContainerExecutionContext(ExecutionContext.global)
    }
  }

  "componentEditorResult" should {

    "in devMode" should {
      "call bundler.singleBundle" in new scope {
        wait(controller.componentEditorResult("type", req))
        there was one(bundler).singleBundle("type", "editor", true)
      }

      "call renderer.render" in new scope {
        wait(controller.componentEditorResult("type", req))
        there was one(renderer).render(any[SingleComponentScriptBundle], m_eq("tabs"), any[ComponentEditorOptions], m_eq(false))
      }
    }

    "in prodMode" should {

      trait prodScope extends scope {
        override val mode = Mode.Prod
      }

      "call bundler.singleBundle" in new prodScope {
        wait(controller.componentEditorResult("type", req))
        there was one(bundler).singleBundle("type", "editor", false)
      }

      "call renderer.render" in new prodScope {
        wait(controller.componentEditorResult("type", req))
        there was one(renderer).render(any[SingleComponentScriptBundle], m_eq("tabs"), any[ComponentEditorOptions], m_eq(true))
      }
    }

    "call bundler.singleBundle - prod mode" in new scope {
      override val mode = Mode.Prod
      val result = wait(controller.componentEditorResult("type", req))
      there was one(bundler).singleBundle("type", "editor", false)
    }

    "call renderer.render - dev mode" in new scope {
      val result = wait(controller.componentEditorResult("type", req))
      there was one(renderer).render(any[SingleComponentScriptBundle], m_eq("tabs"), any[ComponentEditorOptions], m_eq(false))
    }

  }
}
