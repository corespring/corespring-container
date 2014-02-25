package org.corespring.shell.controllers.editor

import org.corespring.container.client.actions.{ ItemActions => ContainerItemActions, NewItemRequest, SaveItemRequest, ItemRequest, ScoreItemRequest }
import org.corespring.mongo.json.services.MongoService
import play.api.http.Status.BAD_REQUEST
import play.api.libs.json.JsString
import play.api.libs.json.Json
import play.api.mvc.Results._
import play.api.mvc.{ Action, Result, AnyContent }

trait ItemActions extends ContainerItemActions[AnyContent] {
  def itemService: MongoService

  override def load(itemId: String)(block: (ItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
    request =>
      itemService.load(itemId).map {
        item =>
          block(ItemRequest(item, request))
      }.getOrElse(NotFound(s"Can't find item with id $itemId"))
  }

  override def save(itemId: String)(block: (SaveItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
    request =>
      itemService.load(itemId).map {
        item =>
          block(SaveItemRequest(item, itemService.save, request))
      }.getOrElse(NotFound(s"Can't find item with id $itemId"))
  }

  override def getScore(itemId: String)(block: (ScoreItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
    request =>
      itemService.load(itemId).map {
        item =>
          block(ScoreItemRequest(item, request))
      }.getOrElse(NotFound(s"Can't find item with id $itemId"))
  }

  override def create(error: (Int, String) => Result)(block: (NewItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
    request =>

      val newItem = Json.obj(
        "components" -> Json.obj(),
        "metadata" -> Json.obj(
          "title" -> JsString("New title")),
        "xhtml" -> "<div></div>")

      itemService.create(newItem).map {
        oid =>
          block(NewItemRequest(oid.toString, request))
      }.getOrElse(error(BAD_REQUEST, "Error creating item"))
  }

}

