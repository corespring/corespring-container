package org.corespring.container.client.actions

import play.api.libs.json.JsValue
import play.api.mvc.{ WrappedRequest, Request }

object requests {
  def isCompleteFromSession(session: JsValue): Boolean = {
    (session \ "isComplete").asOpt[Boolean].getOrElse(false)
  }
}

trait SecureMode {
  def isSecure: Boolean

  def isComplete: Boolean
}

case class PlayerRequest[A](item: JsValue, r: Request[A], itemSession: Option[JsValue] = None) extends WrappedRequest(r)

case class SessionIdRequest[A](sessionId: String, r: Request[A]) extends WrappedRequest(r)

case class FullSession(everything: JsValue, val isSecure: Boolean)

case class SessionOutcome(
                           item: JsValue,
                           itemSession: JsValue,
                           isSecure: Boolean,
                           isComplete: Boolean) extends SecureMode

case class ItemRequest[A](item: JsValue, r: Request[A]) extends WrappedRequest(r)
case class NewItemRequest[A](itemId: String, r: Request[A]) extends WrappedRequest(r)

case class SaveItemRequest[A](item: JsValue, save: (String, JsValue, Option[String]) => Option[JsValue], r: Request[A]) extends WrappedRequest(r)
case class ScoreItemRequest[A](item: JsValue, r: Request[A]) extends WrappedRequest(r)

case class NewSupportingMaterialRequest[A](save: (String, JsValue) => Either[JsValue, String], r: Request[A]) extends WrappedRequest(r)

/**
 * @param everything - should contain "item" -> item json, "session" - session json
 * @param saveSession
 * @param r
 * @tparam A
 */
case class SubmitSessionRequest[A](everything: JsValue, saveSession: (String, JsValue) => Option[JsValue], r: Request[A]) extends WrappedRequest(r)
case class SaveSession(
                        existingSession: JsValue,
                        isSecure: Boolean,
                        isComplete: Boolean,
                        saveSession: (String, JsValue) => Option[JsValue]) extends SecureMode

/**
 * @param isSecure - whether the player will run in secureMode - ake some capabilities will be locked down.
 * @param errors - if there were any errors loading the player js
 */
case class PlayerJsRequest[A](isSecure: Boolean,
  r: Request[A],
  errors: Seq[String] = Seq.empty,
  queryParams: Seq[(String, String)] = Seq.empty) extends WrappedRequest(r)

case class DeleteAssetRequest[A](error: Option[String], r: Request[A]) extends WrappedRequest[A](r)
