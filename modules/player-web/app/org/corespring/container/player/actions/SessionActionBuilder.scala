package org.corespring.container.player.actions

import play.api.libs.json.JsValue
import play.api.mvc._

/** A wrapped request */
case class SessionRequest[A]( sessionJson : JsValue, r: Request[A]) extends WrappedRequest(r)

case class FullSessionRequest[A]( everything : JsValue, r: Request[A]) extends WrappedRequest(r)

trait SessionActionBuilder[A]{
    def loadEverything(id:String)(block: FullSessionRequest[A] => Result) : Action[AnyContent]
    def load(id:String)(block: SessionRequest[A] => Result) : Action[AnyContent]
    def save(id:String)(block: SessionRequest[A] => Result) : Action[AnyContent]
}
