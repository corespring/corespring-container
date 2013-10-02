package org.corespring.container.player.actions

import play.api.libs.json.JsValue
import play.api.mvc._

/** A wrapped request */
case class SessionRequest[A]( sessionJson : JsValue, r: Request[A]) extends WrappedRequest(r)

trait SessionActionBuilder[A]{
    def load(id:String)(block: SessionRequest[A] => Result) : Action[AnyContent]
    def save(id:String)(block: SessionRequest[A] => Result) : Action[AnyContent]
}
