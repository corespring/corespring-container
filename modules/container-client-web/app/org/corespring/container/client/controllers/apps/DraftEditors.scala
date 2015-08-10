package org.corespring.container.client.controllers.apps

import org.corespring.container.client.views.txt.js.EditorServices
import play.api.libs.json._

trait BaseDraftEditor extends CoreEditor {

  import org.corespring.container.client.controllers.resources.{ routes => resourceRoutes }

  override def servicesJs(id: String, components:JsArray, widgets:JsArray): String = {
    EditorServices(
      s"$context.services",
      resourceRoutes.ItemDraft.load(id),
      resourceRoutes.ItemDraft.saveSubset(id, ":subset"),
      Some(resourceRoutes.ItemDraft.save(id)),
      resourceRoutes.ItemDraft.createSupportingMaterial(id),
      resourceRoutes.ItemDraft.createSupportingMaterialFromFile(id, ":materialType", ":filename"),
      components, widgets).toString
  }
}

trait DraftEditor extends BaseDraftEditor{
  override def context = "editor"
}

trait DraftDevEditor extends BaseDraftEditor{
  override def context = "dev-editor"
}
