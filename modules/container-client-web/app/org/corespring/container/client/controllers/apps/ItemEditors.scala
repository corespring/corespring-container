package org.corespring.container.client.controllers.apps

import org.corespring.container.client.controllers.resources
import org.corespring.container.client.views.txt.js.EditorServices
import play.api.libs.json.{JsArray}

trait BaseItemEditor extends CoreEditor {

  import resources.{ routes => resourceRoutes }

  override def servicesJs(draftId: String, components: JsArray, widgets:JsArray) = {
    EditorServices(
      s"$context.services",
      resourceRoutes.Item.load(draftId),
      resourceRoutes.Item.saveSubset(draftId, ":subset"),
      None,
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
