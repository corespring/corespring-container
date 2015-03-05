package org.corespring.container.client.controllers.helpers

import org.specs2.mutable.Specification

class XhtmlCleanerTest extends Specification with XhtmlCleaner {

  "cleanXhtml" should {

    val markup = "<body><style type='text/css'>body { font-weight: bold; }</style></body>"

    "not remove <style/> tags" in {
      cleanXhtml(markup) must be equalTo(markup)
    }

  }

}
