package org.corespring.container.client.controllers.helpers

import org.specs2.mutable.Specification

class XhtmlProcessorTest extends Specification {

  implicit def PlatformString(s: String) = new {
    def removeNewlines = {
      s.replaceAll("\r", "").replaceAll("\n", "")
    }
  }

  "tagNamesToAttributes" should {

    "change tag labels to <div/> with tag label as attribute" in {

      val xhtml = """<div><corespring-apple id="1"></corespring-apple><corespring-banana id="2"></corespring-banana></div>"""
      XhtmlProcessor.tagNamesToAttributes(xhtml).trim.removeNewlines ===
        """<div><div corespring-apple="corespring-apple" id="1"></div><div corespring-banana="corespring-banana" id="2"></div></div>""".removeNewlines
    }

    "keep nested tag structure intact" in {
      val xhtml = "<corespring-one><corespring-two>Content</corespring-two></corespring-one>"
      XhtmlProcessor.tagNamesToAttributes(xhtml).trim.removeNewlines ===
        """<div corespring-one="corespring-one"><div corespring-two="corespring-two">Content</div></div>""".removeNewlines
    }

    "preserve nesting" in {
      val xhtml = "<p>Hello<corespring-one><corespring-two>Content</corespring-two></corespring-one>World</p>"
      XhtmlProcessor.tagNamesToAttributes(xhtml).trim.removeNewlines ===
        """<p>Hello<div corespring-one="corespring-one"><div corespring-two="corespring-two">Content</div></div>World</p>""".stripMargin.removeNewlines
    }

  }

  "translateParagraphsToDivs" should {

    "convert p tags to divs" in {
      val xhtml = "<p>Hello</p>"
      XhtmlProcessor.translateParagraphsToDivs(xhtml).trim.removeNewlines ===
        """<div class="para">Hello</div>""".removeNewlines
    }

    "convert p tags to divs and keep class" in {
      val xhtml = """<p class="p-intro2">Hello</p>"""
      XhtmlProcessor.translateParagraphsToDivs(xhtml).trim.removeNewlines ===
        """<div class="para p-intro2">Hello</div>""".removeNewlines
    }
  }

  "toWellFormedXhtml" should {
    "be able to handle xhtml with multiple paragraphs as root nodes" in {
      val xhtml = """<p>one</p><p>two</p>"""
      XhtmlProcessor.toWellFormedXhtml(xhtml).trim.removeNewlines ===
        """<div class="para">one</div><div class="para">two</div>""".removeNewlines
    }

    "be able to handle xhtml with multiple arbitray nodes as root nodes" in {
      val xhtml = """<h1>Regression test item multiple-choice.json</h1><corespring-multiple-choice id="3"></corespring-multiple-choice>"""
      XhtmlProcessor.toWellFormedXhtml(xhtml).trim.removeNewlines ===
        """<h1>Regression test item multiple-choice.json</h1><div id="3" corespring-multiple-choice="corespring-multiple-choice"/>""".removeNewlines
    }

    "be able to deal with open br tags" in {
      val xhtml = """<p>line one<br>line two</p>"""
      XhtmlProcessor.toWellFormedXhtml(xhtml).trim.removeNewlines ===
        """<div class="para">line one<br/>line two</div>""".removeNewlines
    }

    "not remove essential whitespace within xhtml" in {
      val xhtml = """This is <i>emphasized</i> within the html."""
      XhtmlProcessor.toWellFormedXhtml(xhtml) must beEqualTo(xhtml)
    }

  }

  "documenting the unwanted behaviour of toWellFormedXhtml " should {

    "show that empty tags are converted to to self-closing tags" in {
      val xhtml = """<div></div>"""
      XhtmlProcessor.toWellFormedXhtml(xhtml).trim.removeNewlines ===
        """<div/>""".removeNewlines
    }

    "show that custom tags are removed" in {
      val xhtml = """<custom-tag></custom-tag>"""
      XhtmlProcessor.toWellFormedXhtml(xhtml).trim.removeNewlines ===
        """""".removeNewlines
    }

    "show that input tags are wrapped into form tags" in {
      val xhtml = """<input />"""
      XhtmlProcessor.toWellFormedXhtml(xhtml).trim.removeNewlines ===
        """<form><input/></form>""".removeNewlines
    }

  }

}
