package org.corespring.container.services

import play.api.libs.json.JsValue

trait SessionService {

  def save(id:String,session:JsValue) : Option[JsValue]
}
