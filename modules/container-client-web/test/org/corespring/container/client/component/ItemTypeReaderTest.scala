package org.corespring.container.client.component

import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.Json

class ItemTypeReaderTest extends Specification with ComponentMaker {

  val item = Json.obj(
    "components" -> Json.obj(
      "1" -> Json.obj(
        "componentType" -> "org-ui-1")),
    "xhtml" -> "<org-layout-1></org-layout-1>")

  "type reader" should {

    "work" in new withReader() {
      reader.componentTypes("", item) === Seq.empty
    }

    "work with comps" in new withReader(
      uiComp("ui-1", Seq.empty)) {
      reader.componentTypes("", item) === Seq("org-ui-1")
    }

    "work with comps declared in layout" in new withReader(
      layout("layout-1")) {
      reader.componentTypes("", item) === Seq("org-layout-1")
    }
  }

  class withReader(comps: Component*) extends Scope {
    val reader = new PlayerItemTypeReader {
      override def components: Seq[Component] = comps
    }
  }
}
