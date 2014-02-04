package org.corespring.shell.controllers.editor

import org.corespring.container.client.actions.{ScoreItemRequest, ItemActions, SaveItemRequest, ItemRequest}
import org.corespring.container.client.controllers.resources.{Item => ContainerItem}
import org.corespring.mongo.json.services.MongoService
import play.api.mvc.{Action, Result, AnyContent}
import play.api.libs.json.{JsString, Json}

trait Item extends ContainerItem {

  def itemService: MongoService

  override def actions: ItemActions[AnyContent] = new ItemActions[AnyContent] {

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

    override def create(block: (ItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>

        val newItem = Json.obj(
          "components" -> Json.obj(),
          "metadata" -> Json.obj(
            "title" -> JsString("New title")
          ),
          "xhtml" -> "<div></div>"
        )

        itemService.create(newItem).map {
          oid =>
            val item = newItem ++ Json.obj("_id" -> Json.obj("$oid" -> oid.toString))
            block(ItemRequest(item, request))
        }.getOrElse(BadRequest("Error creating item"))
    }
  }
}
