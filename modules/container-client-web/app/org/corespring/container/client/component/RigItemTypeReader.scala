package org.corespring.container.client.component

import play.api.libs.json.JsValue

trait RigItemTypeReader extends ItemTypeReader {
  /** for an item - return all the components in use */
  override def componentTypes(json: JsValue): Seq[String] = {
    Seq("??? rig item type reader ???")
  }
}
