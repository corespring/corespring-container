package org.corespring.container.client.controllers.apps

import org.corespring.container.client.controllers.{ AssetsController, resources }
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.libs.json.{JsArray, Json, JsValue}

trait DraftDevEditor
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
