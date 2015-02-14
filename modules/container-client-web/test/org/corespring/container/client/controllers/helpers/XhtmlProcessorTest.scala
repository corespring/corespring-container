package org.corespring.container.client.controllers.helpers

import org.specs2.mutable.Specification
import org.specs2.specification.Scope

class XhtmlProcessorTest extends Specification {

  implicit def PlattformString(s: String) = new {
    def toUnix = {
      s.replaceAll("\r\n", "\n").replaceAll("\r", "")
    }
  }

  import XhtmlProcessor._

  case class assertWellFormed(s:String, expected:Option[String] = None) extends Scope{
    val e = expected.getOrElse(s)
    toWellFormedXhtml(s) === e
  }

  "XhtmlProcessor" should {

    "toWellFormedXhtml" should {

      "not change valid xhtml" in assertWellFormed(
        """
          |<div>
          |  hello there
          |</div>
        """.stripMargin
      )

      "preserves white space" in assertWellFormed(" <br> ", Some(" <br /> "))
      "preserves double white spaces" in assertWellFormed("  <br>  ", Some("  <br />  "))
      "fixes brs" in assertWellFormed("<div><br> a</div>", Some("<div><br /> a</div>"))
      "doesn't strip white space in <em>" in assertWellFormed("<div><br /><em>a</em> a</div>")
      "doesn't strip white space in <i>" in assertWellFormed("<div>what does <i>extracting</i> mean</div>")
      "wrap markup if needed" in assertWellFormed("apple <br/>", Some("<div>apple <br /></div>"))
    }

    "tagNamesToAttributes" should {


      "change the tags" in {
        val xhtml = """<div><corespring-apple id="1"></corespring-apple><corespring-banana id="2"></corespring-banana></div>"""
        tagNamesToAttributes(Seq("corespring-apple", "corespring-banana"))(xhtml).get.trim.toUnix ===
          """<div><div id="1" corespring-apple=""></div><div id="2" corespring-banana=""></div></div>""".toUnix
      }

      "keep nested tag structure intact" in {
        val xhtml = "<corespring-one><corespring-two>Content</corespring-two></corespring-one>"
        tagNamesToAttributes(Seq("corespring-one", "corespring-two"))(xhtml).get.trim.toUnix ===
          """<div corespring-one=""><div corespring-two="">Content</div></div>""".toUnix
      }

      "does convert p tags to divs" in {
        val xhtml = "<p>Hello</p>"
        tagNamesToAttributes(Seq.empty)(xhtml).get.trim.toUnix ===
          """<div class="para">Hello</div>""".toUnix
      }

      "does convert p tags to divs and keeps class" in {
        val xhtml = """<p class="p-intro2">Hello</p>"""
        tagNamesToAttributes(Seq.empty)(xhtml).get.trim.toUnix ===
          """<div class="para p-intro2">Hello</div>""".toUnix
      }

      "does not split tags" in {
        val xhtml =
          """<p>Hello
          |<corespring-one><corespring-two>Content</corespring-two></corespring-one>World</p>""".stripMargin
        tagNamesToAttributes(Seq("corespring-one", "corespring-two"))(xhtml).get.trim.toUnix ===
          """<div class="para">Hello
          |<div corespring-one=""><div corespring-two="">Content</div></div>World</div>""".stripMargin.toUnix
      }
    }
  }

}
