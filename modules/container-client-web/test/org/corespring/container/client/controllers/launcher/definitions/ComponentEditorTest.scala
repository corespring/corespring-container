package org.corespring.container.client.controllers.launcher.definitions

import org.corespring.container.client.controllers.resources.SingleComponent
import org.corespring.container.client.hooks.PlayerJs
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import play.api.mvc.Session

class ComponentEditorTest extends Specification with Mockito {

  trait scope extends Scopes.launcher
  "result" should {
    "call builder.buildJs" in new scope {
      val editor = new ComponentEditor(
        builder,
        Map.empty,
        PlayerJs(false, mock[Session]))
      editor.result("url")
      there was one(builder).buildJs("url", editor.fileNames, editor.options, editor.bootstrap, Map.empty)
    }

    "add singleComponentKey to options" in new scope {
      val editor = new ComponentEditor(builder, Map.empty, PlayerJs(false, mock[Session]))
      (editor.options \ "singleComponentKey").asOpt[String] must_== Some(SingleComponent.Key)
    }

    "add errors to options" in new scope {
      val editor = new ComponentEditor(builder, Map.empty, PlayerJs(false, mock[Session], errors = Seq("err")))
      (editor.options \ "errors").as[Seq[String]] must_== Seq("err")
    }
  }
}
