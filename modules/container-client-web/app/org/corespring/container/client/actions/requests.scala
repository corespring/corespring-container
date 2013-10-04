package org.corespring.container.client.actions

import play.api.libs.json.JsValue
import play.api.mvc.{WrappedRequest, Request}

case class PlayerRequest[A](item: JsValue, r: Request[A], itemSession: Option[JsValue] = None) extends WrappedRequest(r)

case class FullSessionRequest[A]( everything : JsValue, r: Request[A]) extends WrappedRequest(r)

case class ItemRequest[A](item: JsValue, r : Request[A]) extends WrappedRequest(r)

case class SaveItemRequest[A](item: JsValue, save: (String,JsValue) => Option[JsValue], r : Request[A]) extends WrappedRequest(r)

/**
 * @param everything - should contain "item" -> item json, "session" - session json
 * @param saveSession
 * @param r
 * @tparam A
 */
case class SubmitAnswersRequest[A](everything: JsValue, saveSession: (String, JsValue) => Option[JsValue], r: Request[A]) extends WrappedRequest(r)
