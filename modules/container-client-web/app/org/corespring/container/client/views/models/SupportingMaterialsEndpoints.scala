package org.corespring.container.client.views.models

import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json.{ Json }
import play.api.mvc.Call

case class SupportingMaterialsEndpoints(create: Call, createFromFile: Call, delete: Call, addAsset: Call, deleteAsset: Call, getAsset: Call) {

  implicit def toMethodAndUrl(c: Call): JsValueWrapper = Json.obj("method" -> c.method.toLowerCase, "url" -> c.url)

  protected def json = {
    Json.obj(
      "create" -> create,
      "createFromFile" -> createFromFile,
      "delete" -> delete,
      "addAsset" -> addAsset,
      "deleteAsset" -> deleteAsset,
      "getAsset" -> getAsset)
  }

  def toJsonString = s"""${Json.stringify(json)}"""
}
