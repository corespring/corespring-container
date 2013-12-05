package org.corespring.container.client.controllers.helpers

import org.specs2.mutable.Specification

class XhtmlProcessorTest extends Specification with XhtmlProcessor {

  "XhtmlProcessor" should {

    "process" in {

      val xhtml = "<div><corespring-apple id='1'></corespring-apple><corespring-banana id='2'></corespring-banana></div>"

      tagNamesToAttributes(xhtml).trim ===
        """<div>
          |<div id="1" corespring-apple=""></div>
          |<div id="2" corespring-banana=""></div>
          |</div>""".stripMargin

    }
  }

}
