package org.corespring.container.client.controllers.resources

import org.specs2.mutable.Specification
import play.api.libs.json.Json

class ItemDraftJsonTest extends Specification {

  val json = Json.obj(
    "_id" -> Json.obj("$oid" -> "1"),
    "xhtml" -> "<p>hello</p>")

  val itemJson = ItemJson(Seq.empty, json)
  "ItemJson" should {

    "add itemId" in {
      (itemJson \ "itemId").as[String] === "1"
    }

    "prep the xhtml" in {
      (itemJson \ "xhtml").as[String] === """<div class="para">hello</div>"""
    }

    "not set itemId if _id.$oid is missing" in {
      val out = ItemJson(Seq.empty, Json.obj("xhtml" -> "x"))
      (out \ "itemId").asOpt[String] === None
    }
  }
}
