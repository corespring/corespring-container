package org.corespring.container.client.controllers.launcher.definitions

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.controllers.launcher.JsBuilder
import org.corespring.container.client.controllers.resources.SingleComponent
import org.corespring.container.client.hooks.PlayerJs
import play.api.libs.json.JsObject
import play.api.libs.json.Json._
import play.api.mvc.RequestHeader

private[launcher] object ComponentEditor extends LaunchCompanionUtils {
  def apply(playerConfig: V2PlayerConfig, rh: RequestHeader, builder: JsBuilder)(implicit js: PlayerJs): ComponentEditor = {
    ComponentEditor(builder, params(rh), js: PlayerJs)
  }
}

private[launcher] case class ComponentEditor(
  builder: JsBuilder,
  queryParams: Map[String, String],
  js: PlayerJs) extends CorespringJsClient {

  override val fileNames = Seq("draft.js", "component-editor.js")

  override val bootstrap =
    """
      |var modules = corespring.require('component-editor');
      |org.corespring.players.ComponentEditor = modules.Standalone;
      |org.corespring.players.ItemComponentEditor = modules.Item;
      |org.corespring.players.DraftComponentEditor = modules.Draft;
      |org.corespring.players.QuestionComponentEditor = modules.QuestionComponentEditor;
      |org.corespring.editors.ComponentEditor = modules.Standalone;
      |org.corespring.editors.ItemComponentEditor = modules.Item;
      |org.corespring.editors.DraftComponentEditor = modules.Draft;
      |org.corespring.editors.QuestionComponentEditor = modules.QuestionComponentEditor;
    """.stripMargin

  private object r {

    import org.corespring.container.client.controllers.{ apps, resources }

    val componentEditor = apps.routes.ComponentEditor
    val itemEditor = apps.routes.ItemEditor
    val draftEditor = apps.routes.DraftEditor
    val item = resources.routes.Item
    val draft = resources.routes.ItemDraft
  }

  import Implicits._

  override lazy val options: JsObject = obj(
    "errors" -> js.errors,
    "warnings" -> js.warnings,
    "singleComponentKey" -> SingleComponent.Key,
    "paths" -> obj(
      "standaloneEditor" -> r.componentEditor.load(":componentType"),
      "itemEditor" -> obj(
        "singleComponent" -> obj(
          "createWithSingleComponent" -> r.item.createWithSingleComponent(":componentType"),
          "loadData" -> r.item.load(":itemId"),
          "loadEditor" -> r.itemEditor.componentEditor(":itemId"),
          "upload" -> r.itemEditor.uploadFile(":itemId", ":filename"),
          "saveXhtmlAndComponents" -> r.item.saveXhtmlAndComponents(":itemId"))),
      "draftEditor" -> obj(
        "singleComponent" -> obj(
          "createWithSingleComponent" -> r.draft.createWithSingleComponent(":componentType"),
          "commit" -> r.draft.commit(":draftId"),
          "loadData" -> r.draft.load(":draftId"),
          "loadEditor" -> r.draftEditor.componentEditor(":draftId"),
          "upload" -> r.draftEditor.uploadFile(":draftId", ":filename"),
          "saveXhtmlAndComponents" -> r.draft.saveXhtmlAndComponents(":draftId")))))

}
