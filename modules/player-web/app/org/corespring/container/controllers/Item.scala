package org.corespring.container.controllers

import play.api.mvc.{AnyContent, Controller}
import org.corespring.container.player.actions.{SaveItemRequest, ItemRequest, ItemActionBuilder}

trait Item extends Controller {

  def builder : ItemActionBuilder[AnyContent]

  def load(itemId:String) = builder.load(itemId) { request : ItemRequest[AnyContent] =>
    Ok(request.item)
  }

  def save(itemId:String) = builder.save(itemId){ request : SaveItemRequest[AnyContent] =>
    request.body.asJson.map { json =>
      request.save(itemId, json).map{ updatedItem =>
        Ok(updatedItem)
      }.getOrElse(BadRequest("Error saving"))
    }.getOrElse(BadRequest("No json in request body"))
  }

}
