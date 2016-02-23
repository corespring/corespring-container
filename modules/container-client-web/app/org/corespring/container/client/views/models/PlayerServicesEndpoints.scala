package org.corespring.container.client.views.models

import play.api.libs.json.Json
import play.api.libs.json.Json.JsValueWrapper
import play.api.mvc.Call


case class PlayerServicesEndpoints(
    completeResponse: Call,
    getScore: Call,
    loadInstructorData: Call,
    loadSession: Call,
    loadOutcome: Call,
    reopenSession: Call,
    resetSession: Call,
    saveSession: Call) {

  private implicit def toMethodAndUrl(c: Call): JsValueWrapper = Json.obj("method" -> c.method.toLowerCase, "url" -> c.url)

  protected def json = {
    Json.obj(
      "completeResponse" -> completeResponse,
      "getScore" -> getScore,
      "loadInstructorData" -> loadInstructorData,
      "loadSession" -> loadSession,
      "loadOutcome" -> loadOutcome,
      "reopenSession" -> reopenSession,
      "resetSession" -> resetSession,
      "saveSession" -> saveSession)
  }

  def toJsonString = s"""${Json.stringify(json)}"""
}
