package org.corespring.container.client.controllers.apps.componentEditor

import org.corespring.container.client.controllers.apps.ComponentEditorOptions
import org.specs2.mutable.Specification
import org.specs2.specification.Fragments
import play.api.test.FakeRequest

class FormToOptionsTest extends Specification {

  "apply" should {

    "use the default opts if the request has no form" in {
      val request = FakeRequest()
      val options = FormToOptions(request)
      options must_== "tabs" -> ComponentEditorOptions.default
    }

    def assertForm(label: String = "", data: Seq[(String, String)], expected: (String, ComponentEditorOptions)): Fragments = {
      s"$label parse ${data.map(t => s"${t._1}->${t._2}").mkString(", ")} to $expected" in {
        val request = FakeRequest().withFormUrlEncodedBody(data: _*)
        val options = FormToOptions(request)
        options must_== expected
      }
    }

    assertForm("with tab opts",
      Seq("previewMode" -> "tabs", "activePane" -> "preview"),
      "tabs" -> ComponentEditorOptions.default.copy(activePane = Some("preview")))

  }
}
