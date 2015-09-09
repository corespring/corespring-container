package org.corespring.container.client.controllers.resources

import org.corespring.container.client.controllers.helpers.PlayerXhtml
import org.corespring.container.client.hooks.{CoreItemHooks, CreateItemHook}
import play.api.libs.json.{JsObject, JsString, JsValue, Json}
import play.api.mvc._

import scala.concurrent.Future


trait Item extends CoreItem {

  def hooks: CoreItemHooks with CreateItemHook

  def create = Action.async {
    implicit request =>
      hooks.createItem(request.body.asJson).map {
        either =>
          either match {
            case Left(sm) => sm
            case Right(id) => Ok(Json.obj("itemId" -> id))
          }
      }
  }
}
