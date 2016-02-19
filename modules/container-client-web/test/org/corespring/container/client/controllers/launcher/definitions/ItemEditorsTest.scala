package org.corespring.container.client.controllers.launcher.definitions

import org.corespring.container.client.controllers.launcher.ItemEditors
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification

class ItemEditorsTest extends Specification with Mockito {

  trait scope extends Scopes.launcher

  "result" should {

    "call builder.buildJs" in new scope {
      val editors = ItemEditors(builder, Map.empty)
      val result = editors.result("url")
      there was one(builder).buildJs("url", editors.fileNames, editors.options, editors.bootstrap, Map.empty)
    }
  }
}
