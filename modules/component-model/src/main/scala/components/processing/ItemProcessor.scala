package components.processing

import play.api.libs.json.JsValue


trait ItemProcessor {

  /**  Processes an item before rendering */
  def processItem(item:JsValue, settings: JsValue ) : JsValue
}

