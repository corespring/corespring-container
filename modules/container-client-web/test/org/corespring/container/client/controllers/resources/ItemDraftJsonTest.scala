package org.corespring.container.client.controllers.resources

import org.corespring.container.client.ItemAssetResolver
import org.corespring.container.client.controllers.helpers.PlayerXhtml
import org.specs2.mutable.Specification
import play.api.libs.json.Json

class ItemDraftJsonTest extends Specification {

  val playerXhtml = new PlayerXhtml {
    override def itemAssetResolver = new ItemAssetResolver{}
  }

  val json = Json.obj(
    "xhtml" -> "<p>hello</p>")

  val itemJson = ItemJson("1", json, playerXhtml)
  "ItemJson" should {

    "add itemId" in {
      (itemJson \ "itemId").as[String] === "1"
    }

    "prep the xhtml" in {
      (itemJson \ "xhtml").as[String] === """<div class="para">hello</div>"""
    }

  }
}
