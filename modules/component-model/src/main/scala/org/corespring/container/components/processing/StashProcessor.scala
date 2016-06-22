package org.corespring.container.components.processing

import play.api.libs.json.JsValue

trait StashProcessor {

  /**
   * Tries to get the  optional stash object
   */
  def prepareStash(item: JsValue, session: JsValue): Option[JsValue]
}

