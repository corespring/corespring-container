package org.corespring.container.client.controllers.helpers

import org.specs2.mutable.Specification

class XhtmlProcessorTest extends Specification with XhtmlProcessor {

  implicit def PlattformString(s: String) = new {
    def toUnix = {
      s.replaceAll("\r\n", "\n").replaceAll("\r", "")
    }
  }

  "XhtmlProcessor" should {

    "process" in {

      val xhtml = "<div><corespring-apple id='1'></corespring-apple><corespring-banana id='2'></corespring-banana></div>"

      tagNamesToAttributes(xhtml).get.trim.toUnix ===
        """<div>
          |<div id="1" corespring-apple=""></div>
          |<div id="2" corespring-banana=""></div>
          |</div>""".stripMargin.toUnix
    }
  }

}
