package org.corespring.shell.controllers

import play.api.libs.json._
import play.api.mvc.{ RequestHeader, Action, Controller }

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

  def catalog(itemId:String) = Action{ request =>
    import org.corespring.shell.views.html.launchers
    import org.corespring.container.client.controllers.routes.PlayerLauncher

    val tabOpts = {
      request.getQueryString("tabs").map{ tabs =>
        Json.obj("tabs" -> JsObject(tabs.split(",").toSeq.map(_ -> JsBoolean(true))))
      }.getOrElse(Json.obj())
    }

    Ok(launchers.catalog(PlayerLauncher.catalogJs().url, baseJson(request) ++ Json.obj("itemId" -> itemId) ++ tabOpts))
  }

  private def loadPlayer(opts: JsValue) = org.corespring.shell.views.html.launchers.editor(org.corespring.container.client.controllers.routes.PlayerLauncher.editorJs().url, opts)

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