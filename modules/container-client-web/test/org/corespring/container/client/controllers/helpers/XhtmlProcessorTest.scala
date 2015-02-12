package org.corespring.container.client.controllers.helpers

import org.specs2.mutable.Specification

class XhtmlProcessorTest extends Specification {

  import XhtmlProcessor._

  implicit def PlatformString(s: String) = new {
    def removeNewlines = {
      s.replaceAll("\r\n", "\n").replaceAll("\r", "")
    }
  }

  "tagNamesToAttributes" should {

    "change tag labels to <div/> with tag label as attribute" in {

      val xhtml = """<div><corespring-apple id="1"></corespring-apple><corespring-banana id="2"></corespring-banana></div>"""
      xhtml.tagNamesToAttributes.trim.removeNewlines ===
        """<div><div corespring-apple="corespring-apple" id="1"></div><div corespring-banana="corespring-banana" id="2"></div></div>""".removeNewlines
    }

    "keep nested tag structure intact" in {
      val xhtml = "<corespring-one><corespring-two>Content</corespring-two></corespring-one>"
      xhtml.tagNamesToAttributes.trim.removeNewlines ===
        """<div corespring-one="corespring-one"><div corespring-two="corespring-two">Content</div></div>""".removeNewlines
    }

    "preserve nesting" in {
      val xhtml = "<p>Hello<corespring-one><corespring-two>Content</corespring-two></corespring-one>World</p>"
      xhtml.tagNamesToAttributes.trim.removeNewlines ===
        """<p>Hello<div corespring-one="corespring-one"><div corespring-two="corespring-two">Content</div></div>World</p>""".stripMargin.removeNewlines
    }

  }

  "translateParagraphsToDivs" should {

    "convert p tags to divs" in {
      val xhtml = "<p>Hello</p>"
      xhtml.translateParagraphsToDivs.trim.removeNewlines ===
        """<div class="para">Hello</div>""".removeNewlines
    }

    "convert p tags to divs and keep class" in {
      val xhtml = """<p class="p-intro2">Hello</p>"""
      xhtml.translateParagraphsToDivs.trim.removeNewlines ===
        """<div class="para p-intro2">Hello</div>""".removeNewlines
    }

    "not reformat whitespace within xhtml" in {
      val xhtml = """This is <i>emphasized</i> within the html."""
      xhtml.translateParagraphsToDivs must beEqualTo(xhtml)
    }

  }

  "toWellFormedXhtml" should {
    "be able to handle xhtml with multiple paragraphs as root nodes" in {
      val xhtml = """<p>one</p><p>two</p>"""
      xhtml.toWellFormedXhtml.trim.removeNewlines ===
        """<div class="para">one</div><div class="para">two</div>""".removeNewlines
    }

    "be able to handle xhtml with mutiple nodes as root nodes" in {
      val xhtml = """<h1>Regression test item multiple-choice.json</h1><corespring-multiple-choice id="3"></corespring-multiple-choice>"""
      xhtml.toWellFormedXhtml.trim.removeNewlines ===
        """<h1>Regression test item multiple-choice.json</h1><div id="3" corespring-multiple-choice="corespring-multiple-choice"/>""".removeNewlines
    }

    "be able to deal with open br tags" in {
      val xhtml = """<p>line one<br>line two</p>"""
      xhtml.toWellFormedXhtml.trim.removeNewlines ===
        """<div class="para">line one<br/>line two</div>""".removeNewlines
    }
  }

}
