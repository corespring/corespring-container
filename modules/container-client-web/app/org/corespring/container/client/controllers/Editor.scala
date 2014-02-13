package org.corespring.container.client.controllers

import org.corespring.container.client.component.AllItemTypesReader
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.libs.json.{Json, JsValue, JsArray}

trait Editor extends AllItemTypesReader with AppWithServices {
  override def context: String = "editor"

  override def servicesJs = {
    import org.corespring.container.client.controllers.resources.routes._

    val componentJson: Seq[JsValue] = uiComponents.map {
      c =>
        val tag = tagName(c.id.org, c.id.name)
        Json.obj(
          "name" -> c.id.name,
          "icon" -> s"$modulePath/icon/$tag",
          "componentType" -> tag,
          "defaultData" -> c.defaultData
        )
    }

    EditorServices("editor.services", Item.load(":id"), Item.save(":id"), JsArray(componentJson)).toString
  }

  override def additionalScripts: Seq[String] = Seq(org.corespring.container.client.controllers.routes.Editor.services().url)
}


