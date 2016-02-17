package org.corespring.container.client.controllers.apps.componentEditor

import org.corespring.container.client.controllers.apps.ComponentEditorOptions
import org.specs2.mutable.Specification
import play.api.test.FakeRequest

class FormToOptionsTest extends Specification {

  "apply" should {

    "use the default opts if the request has no form" in {

      val request = FakeRequest()
      val options = FormToOptions(request)
      options must_== ComponentEditorOptions.default
    }
  }
}
