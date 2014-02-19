package org.corespring.container.client.component

import play.api.libs.json.JsValue

trait RigItemTypeReader extends ItemTypeReader {
  /** for an item - return all the components in use */
  override def componentTypes(id: String, json: JsValue): Seq[String] = {
    Seq(id)
  }
}
