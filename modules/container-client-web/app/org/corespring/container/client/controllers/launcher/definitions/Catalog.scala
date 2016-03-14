package org.corespring.container.client.controllers.launcher.definitions

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.controllers.launcher.JsBuilder
import org.corespring.container.client.hooks.PlayerJs
import play.api.libs.json.JsObject
import play.api.mvc.RequestHeader
import play.api.libs.json.Json._

private[launcher] object Catalog extends LaunchCompanionUtils {
  def apply(playerConfig: V2PlayerConfig, rh: RequestHeader, builder: JsBuilder)(implicit js: PlayerJs): Catalog = {
    Catalog(builder, params(rh), js)
  }
}

private[launcher] case class Catalog(
  val builder: JsBuilder,
  queryParams: Map[String, String],
  js: PlayerJs) extends CorespringJsClient {
  override def fileNames: Seq[String] = Seq("catalog.js")

  override def bootstrap: String =
    """
      |org.corespring.players.ItemCatalog = corespring.require('catalog');
    """.stripMargin

  import org.corespring.container.client.controllers.apps.routes.{ Catalog => Routes }

  import Implicits._

  override def options: JsObject = obj(
    "errors" -> js.errors,
    "warnings" -> js.warnings,
    "paths" -> obj(
      "catalog" -> Routes.load(":itemId")))
}
