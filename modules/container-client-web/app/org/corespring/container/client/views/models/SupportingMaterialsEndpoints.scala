package org.corespring.container.client.views.models

import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.Call

private object Helpers {
  implicit def toMethodAndUrl(c: Call): JsValueWrapper = Json.obj("method" -> c.method.toLowerCase, "url" -> c.url)
}

case class MainEndpoints(load: Call, saveSubset: Call, save: Option[Call])

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

  protected val json = {
    import Helpers._
    Json.obj(
      "complete" -> complete,
      "getScore" -> getScore,
      "loadInstructorData" -> loadInstructorData,
      "load" -> loadItemAndSession,
      "loadOutcome" -> loadOutcome,
      "reopen" -> reopen,
      "reset" -> reset,
      "save" -> save)
  }

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

  protected val json = {

    import Helpers._

    Json.obj(
      "create" -> create,
      "createFromFile" -> createFromFile,
      "delete" -> delete,
      "addAsset" -> addAsset,
      "deleteAsset" -> deleteAsset,
      "getAsset" -> getAsset,
      "updateContent" -> updateContent)
  }

  val jsonString = Json.stringify(json)
}
