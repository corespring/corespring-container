package org.corespring.shell.controllers

import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{Action, Controller}


trait Launchers extends Controller{

  private def load(url:String, opts:JsValue) = org.corespring.shell.views.html.launchers.editor(url, opts)

  def editorFromItem(itemId:String) = Action{ request =>
    val url = org.corespring.container.client.controllers.routes.PlayerLauncher.editorJs().url
    val devEditor = request.getQueryString("devEditor").exists(_ == "true")
    Ok(load(url, Json.obj("itemId" -> itemId, "devEditor" -> devEditor)))
  }

  def editorFromDraft(draftId:String) = Action{ request =>
    val url = org.corespring.container.client.controllers.routes.PlayerLauncher.editorJs().url
    val devEditor = request.getQueryString("devEditor").exists(_ == "true")

    val (itemId, draftName) = {
      val Array(itemId, draftName) = draftId.split("~")
      (itemId, draftName)
    }
    Ok(load(url, Json.obj("draftName" -> draftName, "itemId" -> itemId, "devEditor" -> devEditor)))
  }
}