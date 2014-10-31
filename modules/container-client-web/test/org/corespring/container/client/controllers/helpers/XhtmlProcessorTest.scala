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
        """<div><div corespring-apple="corespring-apple" id='1'></div><div corespring-banana="corespring-banana" id='2'></div></div>""".toUnix
    }

    "keep nested tag structure intact" in {
      val xhtml = "<corespring-one><corespring-two>Content</corespring-two></corespring-one>"
      tagNamesToAttributes(xhtml).get.trim.toUnix ===
        """<div corespring-one="corespring-one"><div corespring-two="corespring-two">Content</div></div>""".toUnix
    }
  }

}
