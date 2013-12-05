package org.corespring.container.client.controllers.helpers

import org.specs2.mutable.Specification
import org.corespring.container.components.model.LayoutComponent
import play.api.libs.json.Json

class LayoutComponentReadingTest extends Specification with Helpers with LayoutComponentReading{

  "LayoutComponentReading" should {

    "read the comps" in {

      val xml =
        """
          |<div>
          |  <div corespring-comp=""></div>
          |</div>
        """.stripMargin


      val comps = Seq(
         LayoutComponent("corespring", "comp", Seq(), Json.obj())
      )

      layoutTypesInXml(xml, comps) === Seq("corespring-comp")

    }
  }

}
