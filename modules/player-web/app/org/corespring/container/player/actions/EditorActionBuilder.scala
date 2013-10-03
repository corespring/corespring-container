package org.corespring.container.player.actions

import play.api.libs.json.JsValue
import play.api.mvc._

case class ItemRequest[A](item: JsValue, r : Request[A]) extends WrappedRequest(r)
case class SaveItemRequest[A](item: JsValue, save: (String,JsValue) => Option[JsValue], r : Request[A]) extends WrappedRequest(r)

trait ItemActionBuilder[A] {
  def load(itemId:String)(block: ItemRequest[A] => Result ) : Action[AnyContent]
  def save(itemId:String)(block: SaveItemRequest[A] => Result ) : Action[AnyContent]
}
