package org.corespring.shell.controllers

import org.corespring.container.components.model.{Interaction, Component}
import play.api.libs.json._
import play.api.mvc.{ RequestHeader, Action, Controller }
import org.corespring.container.client.controllers.launcher.player.routes.PlayerLauncher
import org.corespring.shell.views.html._

class Launchers(
  interactions : Seq[Interaction]
               ) extends Controller {


  def draftEditorFromItem(itemId: String, devEditor: Boolean) = Action { request =>

    Ok(loadDraftEditorPage(baseJson(request) ++ Json.obj(
      "itemId" -> itemId, "devEditor" -> devEditor)))
  }

  def draftEditor(draftId: String, devEditor: Boolean) = Action { request =>
    val (itemId, draftName) = splitDraftId(draftId)

    Ok(loadDraftEditorPage(baseJson(request) ++ Json.obj(
      "draftName" -> draftName,
      "itemId" -> itemId,
      "devEditor" -> devEditor)))
  }

  def itemEditor(itemId: String, devEditor: Boolean) = Action { request =>
    Ok(loadItemEditorPage(baseJson(request) ++ Json.obj("itemId" -> itemId, "devEditor" -> devEditor)))
  }

  def newItemEditor(devEditor: Boolean) = Action { request =>
    Ok(loadItemEditorPage(baseJson(request) ++ Json.obj("devEditor" -> devEditor)))
  }

  def interactionInfo = {
    val g = interactions.groupBy(_.released)
    val released = g.getOrElse(true, Seq.empty).sortBy(_.componentType)
    val notReleased = g.getOrElse(false, Seq.empty).sortBy(_.componentType)
    (released ++ notReleased).map{ i =>
      i.componentType-> i.released
    }
  }

  def standaloneComponentEditor() = Action { request =>
    val html = launchers.standaloneComponentEditor(componentEditorJsUrl, interactionInfo, Json.obj())
    Ok(html)
  }

  def itemComponentEditor(itemId: Option[String] = None) = Action { request =>
    val opts = itemId.map{ i => Json.obj("itemId" -> i)}.getOrElse(Json.obj())
    val html = launchers.itemComponentEditor(componentEditorJsUrl, interactionInfo, opts)
    Ok(html)
  }

  def draftComponentEditor(itemId : Option[String], draftName : Option[String] = None) = Action { request =>
    val itemIdOpts = itemId.map{ i => Json.obj("itemId" -> i)}.getOrElse(Json.obj())
    val draftNameOpts = itemId.map{ i => Json.obj("draftName" -> i)}.getOrElse(Json.obj())
    val opts = itemIdOpts.deepMerge(draftNameOpts)
    val html = launchers.draftComponentEditor(componentEditorJsUrl, interactionInfo, opts)
    Ok(html)
  }

  def playerFromItem(itemId: String) = Action { request =>
    val jsCall = PlayerLauncher.playerJs()
    Ok(loadPlayerPage(Json.obj("mode" -> "gather", "itemId" -> itemId, "queryParams" -> queryStringToJson(request)), jsCall.url))
  }

  def playerFromSession(sessionId: String) = Action { request =>
    val jsCall = PlayerLauncher.playerJs()
    Ok(loadPlayerPage(Json.obj("mode" -> "gather", "sessionId" -> sessionId, "queryParams" -> queryStringToJson(request)), jsCall.url))
  }

  def playerFromSessionView(sessionId: String) = Action { request =>
    val jsCall = PlayerLauncher.playerJs()
    Ok(loadPlayerPage(Json.obj("mode" -> "view", "evaluate" -> Json.obj(
      "showFeedback" -> true,
      "highlightCorrectResponse" -> true,
      "highlightUserResponse" -> true), "sessionId" -> sessionId, "queryParams" -> queryStringToJson(request)), jsCall.url))
  }

  def queryStringToJson(rh: RequestHeader, ignoreKeys: String*): JsObject = {
    val trimmed = rh.queryString -- ignoreKeys
    JsObject(trimmed.mapValues { v =>
      val joined = v.mkString("")
      joined match {
        case "true" => JsBoolean(true)
        case "false" => JsBoolean(false)
        case _ => JsString(joined)
      }
    }.toSeq)
  }

  def catalog(itemId: String) = Action { request =>
    import org.corespring.shell.views.html.launchers

    val tabOpts = {
      request.getQueryString("tabs").map { tabs =>
        Json.obj("tabs" -> JsObject(tabs.split(",").toSeq.map(_ -> JsBoolean(true))))
      }.getOrElse(Json.obj())
    }

    Ok(launchers.catalog(PlayerLauncher.catalogJs().url, baseJson(request) ++ Json.obj("itemId" -> itemId) ++ tabOpts))
  }

  lazy val editorJsUrl = PlayerLauncher.editorJs().url
  lazy val componentEditorJsUrl = PlayerLauncher.componentEditorJs().url

  private def loadDraftEditorPage(opts: JsValue) = launchers.draftEditor(editorJsUrl, opts)
  private def loadItemEditorPage(opts: JsValue) = launchers.itemEditor(editorJsUrl, opts)
  private def loadPlayerPage(opts: JsValue, jsUrl: String) = org.corespring.shell.views.html.launchers.player(jsUrl, opts)

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