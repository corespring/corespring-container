package org.corespring.container.client.controllers.launcher.definitions

import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json.Json._
import play.api.mvc.Call

private[launcher] object Implicits {
  implicit def callToJsv(c: Call): JsValueWrapper = toJsFieldJsValueWrapper(obj("method" -> c.method, "url" -> c.url))
}
