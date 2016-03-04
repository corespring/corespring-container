package org.corespring.container.client.controllers.launcher.definitions

import org.corespring.container.client.controllers.launcher.ComponentEditor
import org.corespring.container.client.controllers.resources.SingleComponent
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification

class ComponentEditorTest extends Specification with Mockito {

  trait scope extends Scopes.launcher
  "result" should {
    "call builder.buildJs" in new scope {
      val editor = ComponentEditor(builder, Map.empty)
      editor.result("url")
      there was one(builder).buildJs("url", editor.fileNames, editor.options, editor.bootstrap, Map.empty)
    }

    "add singleComponentKey to options" in new scope {
      val editor = ComponentEditor(builder, Map.empty)
      (editor.options \ "singleComponentKey").asOpt[String] must_== Some(SingleComponent.Key)
    }
  }
}
