package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions.{ItemActionBuilder, SaveItemRequest, ItemRequest}
import play.api.libs.json.Json
import play.api.mvc.{AnyContent, Controller}

trait Item extends Controller {

  def builder : ItemActionBuilder[AnyContent]

  def load(itemId:String) = builder.load(itemId) { request : ItemRequest[AnyContent] =>
    Ok(Json.obj("item" -> request.item))
  }

  def save(itemId:String) = builder.save(itemId){ request : SaveItemRequest[AnyContent] =>
    request.body.asJson.map { json =>
      request.save(itemId, json).map{ updatedItem =>
        Ok(updatedItem)
      }.getOrElse(BadRequest("Error saving"))
    }.getOrElse(BadRequest("No json in request body"))
  }

}
