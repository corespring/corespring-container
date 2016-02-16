package org.corespring.container.client.component

import grizzled.slf4j.Logger
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest

class ItemTypeReaderTest extends Specification with ComponentMaker with Mockito {

  val item = Json.obj(
    "components" -> Json.obj(
      "1" -> Json.obj(
        "componentType" -> "org-ui-1")),
    "xhtml" -> "<org-layout-1></org-layout-1>")

  "type reader" should {

    "work" in new withReader() {
      reader.componentTypes(item) === Seq.empty
    }

    "work with comps" in new withReader(
      uiComp("ui-1", Seq.empty)) {
      reader.componentTypes(item) === Seq("org-ui-1")
    }

    "work with comps declared in layout" in new withReader(
      layout("layout-1")) {
      reader.componentTypes(item) === Seq("org-layout-1")
    }

    "work with multiple root nodes in xhtml" in new withReader(
      layout("layout-1")) {
      val itemWithMultipleRootNodesInXhtml = Json.obj(
        "components" -> item \ "components",
        "xhtml" -> "<h1>headline</h1><org-layout-1></org-layout-1>")
      reader.componentTypes(itemWithMultipleRootNodesInXhtml) === Seq("org-layout-1")
    }
  }

  class withReader(comps: Component*) extends Scope {

    implicit val r: RequestHeader = FakeRequest("", "")
    val reader = new PlayerItemTypeReader {
      override def components: Seq[Component] = comps
    }
  }
}
