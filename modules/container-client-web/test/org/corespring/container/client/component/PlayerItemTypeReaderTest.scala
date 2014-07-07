package org.corespring.container.client.component

import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.libs.json.Json

class PlayerItemTypeReaderTest extends Specification with ComponentMaker {

  class readerScope(comps:Seq[Component] = Seq.empty) extends Scope{

    val reader = new PlayerItemTypeReader {
      override def components: Seq[Component] = comps
    }
  }

  "player item type reader" should {
    "work" in new readerScope(){
      reader.componentTypes(Json.obj()) === Seq.empty
    }

    "return widget types" in new readerScope(Seq(widget("w-one"))){
      reader.componentTypes(
        Json.obj(
          "components" -> Json.obj(
            "1" -> Json.obj(
              "componentType" -> "org-w-one"
            )
          )
        )
      ) === Seq("org-w-one")
    }
  }
}
