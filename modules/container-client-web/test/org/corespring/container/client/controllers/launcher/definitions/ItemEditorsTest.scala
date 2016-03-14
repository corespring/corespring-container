package org.corespring.container.client.controllers.launcher.definitions

import org.corespring.container.client.hooks.PlayerJs
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import play.api.mvc.Session

class ItemEditorsTest extends Specification with Mockito {

  trait scope extends Scopes.launcher

  "result" should {

    "call builder.buildJs" in new scope {
      val editors = new ItemEditors(builder, Map.empty, PlayerJs(false, mock[Session]))
      val result = editors.result("url")
      there was one(builder).buildJs("url", editors.fileNames, editors.options, editors.bootstrap, Map.empty)
    }

    "add errors to options" in new scope {
      val editors = new ItemEditors(builder, Map.empty, PlayerJs(false, mock[Session], errors = Seq("err")))
      (editors.options \ "errors").as[Seq[String]] must_== Seq("err")
    }
  }
}
