package org.corespring.shell.controllers.editor

import play.api.mvc.{Action, Result, AnyContent}
import org.corespring.container.client.actions.{ScoreItemRequest, ItemActionBuilder, SaveItemRequest, ItemRequest}
import org.corespring.container.client.controllers.resources.{Item => ContainerItem}
import org.corespring.mongo.json.services.MongoService

trait Item extends ContainerItem{

  def itemService : MongoService

  def builder: ItemActionBuilder[AnyContent] = new ItemActionBuilder[AnyContent] {

    def load(itemId: String)(block: (ItemRequest[AnyContent]) => Result): Action[AnyContent] = Action{ request =>
      itemService.load(itemId).map{ item =>
        block(ItemRequest(item, request))
      }.getOrElse(NotFound(s"Can't find item with id $itemId"))
    }

    def save(itemId: String)(block: (SaveItemRequest[AnyContent]) => Result): Action[AnyContent] = Action { request =>
      itemService.load(itemId).map{ item =>
        block(SaveItemRequest(item, itemService.save, request ))
      }.getOrElse(NotFound(s"Can't find item with id $itemId"))
    }

    def getScore(itemId: String)(block: (ScoreItemRequest[AnyContent]) => Result): Action[AnyContent] = Action{ request =>
      itemService.load(itemId).map{ item =>
        block(ScoreItemRequest(item, request ))
      }.getOrElse(NotFound(s"Can't find item with id $itemId"))
    }
  }
}
