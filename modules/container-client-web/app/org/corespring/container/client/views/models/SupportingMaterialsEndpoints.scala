package org.corespring.container.client.views.models

import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json.{ Writes, JsValue, Json }
import play.api.mvc.Call

private object Helpers {
  implicit def toMethodAndUrl(c: Call): JsValueWrapper = Json.obj("method" -> c.method.toLowerCase, "url" -> c.url)

  implicit val CallWrites: Writes[Call] = Json.writes[Call]
}

import Helpers._

case class MainEndpoints(
  load: Call,
  saveSubset: Call,
  saveXhtmlAndComponents: Call,
  save: Option[Call]) {
  val json = Json.writes[MainEndpoints].writes(this)
  val jsonString = Json.stringify(json)
}

case class ComponentsAndWidgets(components: JsValue, widgets: JsValue)

case class SessionEndpoints(
  loadItemAndSession: Call,
  reopen: Call,
  reset: Call,
  save: Call,
  getScore: Call,
  complete: Call,
  loadOutcome: Call,
  loadInstructorData: Call) {
  protected val json = Json.writes[SessionEndpoints].writes(this)
  val jsonString = Json.stringify(json)
}

case class SupportingMaterialsEndpoints(
  create: Call,
  createFromFile: Call,
  delete: Call,
  addAsset: Call,
  deleteAsset: Call,
  getAsset: Call,
  updateContent: Call) {
  protected val json = Json.writes[SupportingMaterialsEndpoints].writes(this)
  val jsonString = Json.stringify(json)
}
