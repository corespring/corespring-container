package org.corespring.container.client.pages

import org.corespring.container.client.component.{ SingleComponentScriptBundle, ComponentJson }
import org.corespring.container.client.controllers.apps.{ ComponentEditorOptions, EditorClientOptions, TabComponentEditorOptions, PageSourceService }
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.components.model.{ Interaction, Id, ComponentInfo }
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.{ JsValue, Json }

import scala.concurrent.ExecutionContext

class ComponentEditorRendererTest extends Specification with Mockito {

  trait scope extends Scope {

    val containerExecutionContext = ContainerExecutionContext(ExecutionContext.global)

    val jade = {
      val m = mock[JadeEngine]
      m
    }

    val pageSourceService = {
      val m = mock[PageSourceService]
      m
    }

    val componentJson = {
      val m = mock[ComponentJson]
      m
    }

    val assetPathProcessor = {
      val m = mock[AssetPathProcessor]
      m
    }

    val renderer = new ComponentEditorRenderer(
      containerExecutionContext,
      jade,
      pageSourceService,
      componentJson,
      assetPathProcessor,
      versionInfo = Json.obj())
  }

  val component = {
    val m = mock[ComponentInfo]
    m.componentType returns "component"
    m
  }

  "render" should {

    "call renderJade" in new scope {
      val bundle = SingleComponentScriptBundle(component, Seq.empty, Seq.empty, Seq.empty)
      val clientOptions = ComponentEditorOptions.default
      renderer.render(bundle, "tabs", clientOptions)
    }
  }
}
