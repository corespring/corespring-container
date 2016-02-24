package org.corespring.container.client.controllers.apps

import org.corespring.container.client.controllers.resources
import org.corespring.container.client.views.models.SupportingMaterialsEndpoints
import org.corespring.container.client.views.txt.js.{ ComponentEditorServices, EditorServices }
import play.api.libs.json.{ JsValue, JsArray }

trait BaseItemEditor extends CoreEditor {

  import resources.{ routes => resourceRoutes }

  override def servicesJs(itemId: String, components: JsArray, widgets: JsArray) = {

    val smEndpoints = SupportingMaterialsEndpoints(
      create = resourceRoutes.Item.createSupportingMaterial(itemId),
      createFromFile = resourceRoutes.Item.createSupportingMaterialFromFile(itemId),
      delete = resourceRoutes.Item.deleteSupportingMaterial(itemId, ":name"),
      addAsset = resourceRoutes.Item.addAssetToSupportingMaterial(itemId, ":name"),
      deleteAsset = resourceRoutes.Item.deleteAssetFromSupportingMaterial(itemId, ":name", ":filename"),
      getAsset = resourceRoutes.Item.getAssetFromSupportingMaterial(itemId, ":name", ":filename"),
      updateContent = resourceRoutes.Item.updateSupportingMaterialContent(itemId, ":name", ":filename"))

    EditorServices(
      s"$context.services",
      resourceRoutes.Item.load(itemId),
      resourceRoutes.Item.saveSubset(itemId, ":subset"),
      None,
      smEndpoints,
      components,
      widgets).toString
  }
}

trait ItemDevEditor extends BaseItemEditor {
  override def context: String = "dev-editor"
}

trait ItemEditor extends BaseItemEditor {
  override def context: String = "editor"
}
