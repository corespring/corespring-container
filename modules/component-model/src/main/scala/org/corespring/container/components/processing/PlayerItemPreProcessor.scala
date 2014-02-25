package org.corespring.container.components.processing

import play.api.libs.json.JsValue

trait PlayerItemPreProcessor {

  /**
   * Pre processes an item's model before rendering in the player - this allows data to be added/removed as appropriate.
   */
  def preProcessItemForPlayer(item: JsValue, settings: JsValue): JsValue
}

