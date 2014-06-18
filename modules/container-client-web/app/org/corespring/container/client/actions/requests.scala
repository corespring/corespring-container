package org.corespring.container.client.actions

import play.api.libs.json.JsValue

object requests {
  def isCompleteFromSession(session: JsValue): Boolean = {
    (session \ "isComplete").asOpt[Boolean].getOrElse(false)
  }
}

trait SecureMode {
  def isSecure: Boolean

  def isComplete: Boolean
}

case class PlayerData(item: JsValue, itemSession: Option[JsValue] = None)

case class FullSession(everything: JsValue, val isSecure: Boolean)

case class SessionOutcome(
  item: JsValue,
  itemSession: JsValue,
  isSecure: Boolean,
  isComplete: Boolean) extends SecureMode

case class NewSupportingMaterial(save: (String, JsValue) => Either[String, JsValue])

case class SaveSession(
  existingSession: JsValue,
  isSecure: Boolean,
  isComplete: Boolean,
  saveSession: (String, JsValue) => Option[JsValue]) extends SecureMode

/**
 * @param isSecure - whether the player will run in secureMode - ake some capabilities will be locked down.
 * @param errors - if there were any errors loading the player js
 */
case class PlayerJs(
  isSecure: Boolean,
  errors: Seq[String] = Seq.empty,
  queryParams: Seq[(String, String)] = Seq.empty)

case class DeleteAsset(error: Option[String])
