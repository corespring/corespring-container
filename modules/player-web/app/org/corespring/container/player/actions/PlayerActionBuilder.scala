package org.corespring.container.player.actions

import play.api.libs.json.JsValue
import play.api.mvc._

/** A wrapped request */
case class PlayerRequest[A](item: JsValue, r: Request[A]) extends WrappedRequest(r)

trait PlayerActionBuilder[A] {

  def playerAction(id:String)(block: PlayerRequest[A] => Result) : Action[AnyContent]
  def playerAction(p : BodyParser[A])(id:String)(block: PlayerRequest[A] => Result) : Action[AnyContent]

}
