package org.corespring.container.client.controllers.apps

import org.corespring.container.client.controllers.resources
import org.corespring.container.client.controllers.resources.routes
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.libs.json.{Json, JsArray}

trait ItemDevEditor
  extends CoreEditor {

  override def context: String = "dev-editor"

  import resources.{ routes => resourceRoutes }

  override def servicesJs(draftId: String, components: JsArray, widgets:JsArray) = {
    EditorServices(
      "dev-editor.services",
      resourceRoutes.ItemDraft.load(draftId),
      resourceRoutes.ItemDraft.saveSubset(draftId, ":subset"),
      Json.obj(),
      Json.obj()).toString
  }
}
