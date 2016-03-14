package org.corespring.container.client.controllers.launcher.definitions

import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json.Json.obj
import play.api.mvc.Call

private object Implicits {
  implicit def callToJsv(c: Call): JsValueWrapper = play.api.libs.json.Json.toJsFieldJsValueWrapper(obj("method" -> c.method, "url" -> c.url))
}
