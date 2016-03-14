package org.corespring.container.client.controllers.launcher.definitions

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.controllers.launcher.JsBuilder
import org.corespring.container.client.hooks.PlayerJs
import play.api.libs.json.JsObject
import play.api.libs.json.Json._
import play.api.mvc.RequestHeader

private[launcher] object ItemEditors extends LaunchCompanionUtils {

  def apply(playerConfig: V2PlayerConfig, rh: RequestHeader, builder: JsBuilder)(implicit js: PlayerJs): ItemEditors = {
    ItemEditors(builder, params(rh), js)
  }
}

private[launcher] case class ItemEditors(builder: JsBuilder, queryParams: Map[String, String], js: PlayerJs) extends CorespringJsClient {
  import Implicits._
  import org.corespring.container.client.controllers.apps.routes.{ DraftDevEditor => DraftDevEditorRoutes, DraftEditor => DraftEditorRoutes, ItemDevEditor => ItemDevEditorRoutes, ItemEditor => ItemEditorRoutes }
  import org.corespring.container.client.controllers.resources.routes.{ Item => ItemRoutes, ItemDraft => ItemDraftRoutes }

  val paths: JsObject = obj(
    "itemEditor" -> obj(
      "editor" -> ItemEditorRoutes.load(":itemId"),
      "devEditor" -> ItemDevEditorRoutes.load(":itemId"),
      "createItem" -> ItemRoutes.create()),
    "draftEditor" -> obj(
      "editor" -> DraftEditorRoutes.load(":draftId"),
      "devEditor" -> DraftDevEditorRoutes.load(":draftId"),
      "createItemAndDraft" -> ItemDraftRoutes.createItemAndDraft(),
      "commitDraft" -> ItemDraftRoutes.commit(":draftId"),
      "save" -> ItemDraftRoutes.save(":draftId")))

  override lazy val options: JsObject = obj("paths" -> paths, "errors" -> js.errors, "warnings" -> js.warnings)

  override val fileNames: Seq[String] = Seq("item-editor.js", "draft.js", "draft-editor.js")

  override val bootstrap: String =
    """
      |org.corespring.players.ItemEditor = corespring.require('item-editor');
      |org.corespring.players.DraftEditor = corespring.require('draft-editor');
      |org.corespring.editors.ItemEditor = corespring.require('item-editor');
      |org.corespring.editors.DraftEditor = corespring.require('draft-editor');
      |
    """.stripMargin
}
