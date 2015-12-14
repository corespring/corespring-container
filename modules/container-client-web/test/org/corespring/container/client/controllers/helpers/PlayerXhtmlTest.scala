package org.corespring.container.client.controllers.helpers

import org.specs2.mutable.Specification
import org.specs2.specification.Scope

class PlayerXhtmlTest extends Specification {

  implicit class WithoutCarriageReturn(s: String) {
    def withoutCarriageReturn = s.replaceAll("\r", "")
  }

  def addImagePath(imageSrc:String):String = {
    "anchor/" + imageSrc
  }

  case class assertPlayerXhtml(in:String, expected:String) extends Scope{
    PlayerXhtml.mkXhtml(addImagePath, in).trim.withoutCarriageReturn === expected.withoutCarriageReturn
  }

  "preparePlayerXhtml" should {

    "preserves whitespace" in assertPlayerXhtml("<div> <p></p> </div>", """<div> <div class="para"></div> </div>""")
    "not strip space after <em>" in assertPlayerXhtml("<em></em> a", "<em></em> a")
    "not strip space after <i>" in assertPlayerXhtml("<i>a</i> a", "<i>a</i> a")


    "convert <p> to <div class=\"para\">" in assertPlayerXhtml(
      "<p>Hello</p>",
      """<div class="para">Hello</div>"""
    )

    "convert <p class='a'> to <div class='para a'>" in assertPlayerXhtml(
      """<p class="p-intro2">Hello</p>""",
      """<div class="para p-intro2">Hello</div>"""
    )

    "insert image anchor" in assertPlayerXhtml(
      """<img src="test" width="7px" height="8px"/>""",
      """<img src="anchor/test" width="7px" height="8px" />"""
    )

  }

}
