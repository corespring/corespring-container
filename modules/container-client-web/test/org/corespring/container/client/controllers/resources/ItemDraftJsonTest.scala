package org.corespring.container.client.controllers.resources

import org.specs2.mutable.Specification
import play.api.libs.json.Json

class ItemDraftJsonTest extends Specification {

  val json = Json.obj(
    "xhtml" -> "<p>hello</p>")

  def resolveAsset(s:String) = s

  val itemJson = ItemJson("1", resolveAsset, json)
  "ItemJson" should {

    "add itemId" in {
      (itemJson \ "itemId").as[String] === "1"
    }

    "prep the xhtml" in {
      (itemJson \ "xhtml").as[String] === """<div class="para">hello</div>"""
    }

  }
}
