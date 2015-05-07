package org.corespring.shell.controllers

import play.api.libs.json._
import play.api.mvc.{ RequestHeader, Action, Controller }
import org.corespring.shell.views._
import org.corespring.container.client.controllers.routes._

trait Launchers extends Controller {

  def editorFromItem(itemId: String) = Action { request =>

    Ok(loadPlayer(baseJson(request) ++ Json.obj(
      "itemId" -> itemId)))
  }

  def editorFromDraft(draftId: String) = Action { request =>
    val (itemId, draftName) = splitDraftId(draftId)

    Ok(loadPlayer(baseJson(request) ++ Json.obj(
      "draftName" -> draftName,
      "itemId" -> itemId)))
  }

  private def loadPlayer(opts: JsValue) = html.launchers.editor(PlayerLauncher.editorJs().url, opts)

  private def splitDraftId(draftId: String) = {
    val Array(itemId, draftName) = draftId.split("~")
    (itemId, draftName)
  }

  private def baseJson(request: RequestHeader) = {
    JsObject(
      Seq[(String, JsValue)]() ++
        request.getQueryString("devEditor").filter(_ == "true").map("devEditor" -> JsString(_)) ++
        Some(("queryParams", queryParamJson(request))))
  }

  private def queryParamJson(request: RequestHeader) = {
    JsObject(
      Seq[(String, JsValue)]() ++
        request.getQueryString("loggingEnabled").map("loggingEnabled" -> JsString(_)) ++
        request.getQueryString("logCategory").map("logCategory" -> JsString(_)))
  }
}