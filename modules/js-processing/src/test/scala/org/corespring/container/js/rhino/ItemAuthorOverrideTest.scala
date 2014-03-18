package org.corespring.container.js.rhino

import org.specs2.mutable.Specification
import play.api.libs.json.{ JsString, JsObject, Json }

class ItemAuthorOverrideTest extends Specification {

  val authorOverride = new ItemAuthorOverride {
    override def js: String =
      """
        |exports.process = function(item, answers){
        |  return { summary: "Summary" }
        |
        |}
      """.stripMargin
  }

  "ItemAuthorOverride" should {
    "work" in {
      authorOverride.process(Json.obj(), Json.obj()) === JsObject(Seq("summary" -> JsString("Summary")))
    }
  }
}
