package org.corespring.container.client.controllers.helpers

import org.specs2.mutable.Specification
import play.api.libs.json._

class ItemCleanerTest extends Specification {

  "clean" should {

    val components = Seq("one", "two")
    val unreferencedComponents = Seq("two")
    val referencedComponents = components.diff(unreferencedComponents)

    val json = Json.obj("components" -> JsObject(
      components.map(id => id -> Json.obj())
    ))

    val markup = <itemBody>
      {referencedComponents.map(id => <corespring-multiple-choice id={id}></corespring-multiple-choice>)}
    </itemBody>.toString

    val result = ItemCleaner.clean(markup, json)

      "remove unreferenced components from JSON" in {
        (result \ "components").asOpt[JsObject].map(_.keys) match {
          case Some(ids) => ids must be equalTo(referencedComponents.toSet)
          case _ => failure("result did not contain 'components' key in JSON")
        }
      }

  }

}
