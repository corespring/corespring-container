package org.corespring.container.client.controllers.launcher.definitions

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.controllers.launcher.JsBuilder
import org.corespring.container.client.hooks.PlayerJs
import play.api.libs.json.JsObject
import play.api.libs.json.Json._
import play.api.mvc.{ RequestHeader, Session, SimpleResult }

private[launcher] object Player extends LaunchCompanionUtils {
  def apply(playerConfig: V2PlayerConfig, rh: RequestHeader, builder: JsBuilder)(implicit js: PlayerJs): Player = {
    Player(builder, params(rh), js)
  }
}

private[launcher] case class Player(builder: JsBuilder, queryParams: Map[String, String], js: PlayerJs) extends CorespringJsClient {
  override lazy val fileNames: Seq[String] = Seq("player.js")

  override lazy val bootstrap: String =
    s"""
       |org.corespring.players.ItemPlayer = corespring.require('player').define(${js.isSecure});
    """.stripMargin

  override lazy val options: JsObject = {

    val errorsAndWarnings = obj("errors" -> js.errors, "warnings" -> js.warnings)

    import Implicits._
    import org.corespring.container.client.controllers.apps.routes.{ Player => Routes }

    val loadSession = Routes.load(":sessionId")
    val paths = obj("paths" -> obj(
      "createSession" -> Routes.createSessionForItem(":id"),
      "gather" -> loadSession,
      "view" -> loadSession,
      "evaluate" -> loadSession))

    errorsAndWarnings.deepMerge(paths)
  }

  protected def sumSession(s: Session, keyValues: (String, String)*): Session = keyValues.foldRight(s) { case ((key, value), acc) => acc + (key -> value) }
  val SecureMode = "corespring.player.secure"

  override def result(corespringUrl: String): SimpleResult = {
    val finalSession = sumSession(js.session, (SecureMode, js.isSecure.toString))
    super.result(corespringUrl).withSession(finalSession)
  }
}

