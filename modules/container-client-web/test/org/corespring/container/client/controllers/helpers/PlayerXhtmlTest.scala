package org.corespring.container.client.controllers.helpers

import org.corespring.container.client.ItemAssetResolver
import org.specs2.mutable.Specification
import org.specs2.specification.Scope

class PlayerXhtmlTest extends Specification {

  implicit class WithoutCarriageReturn(s: String) {
    def withoutCarriageReturn = s.replaceAll("\r", "")
  }

  val playerXhtml = new PlayerXhtml {
    override def itemAssetResolver = new ItemAssetResolver{}
  }

  case class assertPlayerXhtml(in:String, expected:String) extends Scope{
    playerXhtml.mkXhtml("123", in).trim.withoutCarriageReturn === expected.withoutCarriageReturn
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
      """<img src="/player/item/123/test" width="7px" height="8px" />"""
    )

  }

}
