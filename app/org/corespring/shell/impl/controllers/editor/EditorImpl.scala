package org.corespring.shell.impl.controllers.editor

import org.corespring.container.controllers.Item
import org.corespring.container.player.actions.{ItemRequest, SaveItemRequest, ItemActionBuilder}
import org.corespring.shell.impl.services.MongoService
import play.api.mvc.{Action, Result, AnyContent}

trait ItemImpl extends Item{

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
  }
}
