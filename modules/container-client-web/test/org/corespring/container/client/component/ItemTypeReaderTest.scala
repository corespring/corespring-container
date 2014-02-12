package org.corespring.container.client.component

import org.corespring.container.components.model.Component
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.Json

class ItemTypeReaderTest extends Specification with ComponentMaker {

  val item = Json.obj(
    "components" -> Json.obj(
      "1" -> Json.obj(
        "componentType" -> "org-ui-1"
      )
    ),
    "xhtml" -> "<org-layout-1></org-layout-1>"
  )

  "type reader" should {

    "work" in new withReader() {
      reader.typesInItem(item) === Seq.empty
    }

    "work with comps" in new withReader(
      uiComp("org", "ui-1", Seq.empty)
    ) {
      reader.typesInItem(item) === Seq("org-ui-1")
    }

    "work with comps declared in layout" in new withReader(
      layout("org", "layout-1")
    ) {
      reader.typesInItem(item) === Seq("org-layout-1")
    }
  }


  class withReader(comps: Component*) extends Scope {
    val reader = new ItemTypeReader {
      override def components: Seq[Component] = comps
    }
  }

  /*
  "read the comps" in {

      val xml =
        """
          |<div>
          |  <corespring-comp></corespring-comp>
          |  <div corespring-comp2=""></div>
          |</div>
        """.stripMargin


      val comps = Seq(
         LayoutComponent("corespring", "comp", Seq(), None, Json.obj()),
         LayoutComponent("corespring", "comp2", Seq(), None, Json.obj())
      )

      layoutTypesInXml(xml, comps) === Seq("corespring-comp", "corespring-comp2")

    }
   */

}
