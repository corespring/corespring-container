package org.corespring.container.client.controllers.apps

import org.corespring.container.client.views.models.SupportingMaterialsEndpoints
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.libs.json._

trait BaseDraftEditor extends CoreEditor {

  import org.corespring.container.client.controllers.resources.{ routes => resourceRoutes }

  override def servicesJs(id: String, components: JsArray, widgets: JsArray): String = {

    val smEndpoints = SupportingMaterialsEndpoints(
      create = resourceRoutes.ItemDraft.createSupportingMaterial(id),
      createFromFile = resourceRoutes.ItemDraft.createSupportingMaterialFromFile(id),
      delete = resourceRoutes.ItemDraft.deleteSupportingMaterial(id, ":name"),
      addAsset = resourceRoutes.ItemDraft.addAssetToSupportingMaterial(id, ":name"),
      deleteAsset = resourceRoutes.ItemDraft.deleteAssetFromSupportingMaterial(id, ":name", ":filename"),
      getAsset = resourceRoutes.ItemDraft.getAssetFromSupportingMaterial(id, ":name", ":filename"),
      updateContent = resourceRoutes.ItemDraft.updateSupportingMaterialContent(id, ":name", ":filename"))

    EditorServices(
      s"$context.services",
      resourceRoutes.ItemDraft.load(id),
      resourceRoutes.ItemDraft.saveSubset(id, ":subset"),
      Some(resourceRoutes.ItemDraft.save(id)),
      smEndpoints,
      components, widgets).toString
  }
}

trait DraftEditor extends BaseDraftEditor {
  override def context = "editor"
}

trait DraftDevEditor extends BaseDraftEditor {
  override def context = "dev-editor"
}
