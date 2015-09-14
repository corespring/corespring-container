package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.{ CoreItemHooks, CreateItemHook }
import play.api.libs.json.Json
import play.api.mvc.Action

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
