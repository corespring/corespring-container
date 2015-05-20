package org.corespring.container.client.controllers.apps

import org.corespring.container.client.views.txt.js.EditorServices
import play.api.libs.json._

trait DraftEditor
  extends CoreEditor {

  import org.corespring.container.client.controllers.resources.{ routes => resourceRoutes }

  override def servicesJs(id: String, components:JsArray, widgets:JsArray): String = {
    EditorServices(
      s"$context.services",
      resourceRoutes.ItemDraft.load(id),
      resourceRoutes.ItemDraft.saveSubset(id, ":subset"),
      components, widgets).toString
  }
}

