package org.corespring.container.client.controllers.helpers

import org.specs2.mutable.Specification

class XhtmlProcessorTest extends Specification with XhtmlProcessor {

  "XhtmlProcessor" should {

    "process" in {


      val names = Seq(("apple", "div"), ("banana", "span"))

      val xhtml = "<div><apple id='1'></apple><banana id='2'></banana></div>"

      tagNamesToAttributes(names, xhtml).trim ===
        """<div>
          |<div id="1" apple=""></div>
          |<span id="2" banana=""></span>
          |</div>""".stripMargin

    }
  }

}
