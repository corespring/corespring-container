package org.corespring.container.client.controllers.apps

import org.corespring.container.client.controllers.resources
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.libs.json.{JsArray}

trait BaseItemEditor extends CoreEditor {

  import resources.{ routes => resourceRoutes }

  override def servicesJs(itemId: String, components: JsArray, widgets:JsArray) = {
    EditorServices(
      s"$context.services",
      resourceRoutes.Item.load(itemId),
      resourceRoutes.Item.saveSubset(itemId, ":subset"),
      None,
      resourceRoutes.Item.createSupportingMaterial(itemId),
      resourceRoutes.Item.createSupportingMaterialFromFile(itemId, ":materialType", ":filename"),
      components,
      widgets).toString
  }
}

trait ItemDevEditor extends BaseItemEditor
{
  override def context: String = "dev-editor"
}

trait ItemEditor extends BaseItemEditor
{
  override def context: String = "editor"
}
