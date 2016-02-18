package org.corespring.container.client.controllers.launcher

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.hooks.PlayerJs
import org.corespring.container.client.io.ResourcePath
import play.api.Play
import play.api.http.ContentTypes
import play.api.libs.json.JsObject
import play.api.libs.json.Json._
import play.api.mvc.{ Call, RequestHeader, Session, SimpleResult }

private[launcher] trait LaunchCompanionUtils {
  def params(rh: RequestHeader) = rh.queryString.mapValues(_.mkString(""))
  def url(cfg: V2PlayerConfig, rh: RequestHeader) = cfg.rootUrl.getOrElse(BaseUrl(rh))
  import play.api.Play.current
  val loader = new ResourcePath(Play.resource(_))
  def resourceToString(s: String): Option[String] = {
    loader.loadPath(s)
  }
}

private[launcher] trait FullPath {
  def fullPath(n: String) = s"container-client/js/player-launcher/$n"
}

trait CorespringJsClient extends FullPath {

  implicit def callToJsv(c: Call): JsValueWrapper = toJsFieldJsValueWrapper(obj("method" -> c.method, "url" -> c.url))

  def builder: JsBuilder
  def corespringUrl: String
  def fileNames: Seq[String]
  def bootstrap: String
  def options: JsObject
  def queryParams: Map[String, String]

  lazy val src = builder.buildJs(fileNames, options, bootstrap, queryParams)

  def result: SimpleResult = {
    import play.api.mvc.Results.Ok
    Ok(src).as(ContentTypes.JAVASCRIPT)
  }
}

private[launcher] object Catalog extends LaunchCompanionUtils {
  def apply(playerConfig: V2PlayerConfig, rh: RequestHeader, builder: JsBuilder): Catalog = {
    Catalog(url(playerConfig, rh), builder, params(rh))
  }
}

private[launcher] case class Catalog(corespringUrl: String, val builder: JsBuilder, queryParams: Map[String, String]) extends CorespringJsClient {
  override def fileNames: Seq[String] = Seq("catalog.js")

  override def bootstrap: String =
    """
      |org.corespring.players.ItemCatalog = corespring.require('catalog');
    """.stripMargin

  import org.corespring.container.client.controllers.apps.routes.{ Catalog => Routes }

  override def options: JsObject = obj(
    "paths" -> obj(
      "catalog" -> Routes.load(":itemId")))
}

private[launcher] object Player extends LaunchCompanionUtils {
  def apply(playerConfig: V2PlayerConfig, rh: RequestHeader, playerJs: PlayerJs): Player = {
    Player(url(playerConfig, rh), resourceToString(_), params(rh), playerJs)
  }
}

private[launcher] case class Player(corespringUrl: String, builder: JsBuilder, queryParams: Map[String, String], playerJs: PlayerJs) extends CorespringJsClient {
  override lazy val fileNames: Seq[String] = Seq("player.js")

  override lazy val bootstrap: String =
    s"""
      |org.corespring.players.ItemPlayer = corespring.require('player').define(${playerJs.isSecure});
    """.stripMargin

  override lazy val options: JsObject = {

    val errorsAndWarnings = obj("errors" -> playerJs.errors, "warnings" -> playerJs.warnings)

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

  override val result: SimpleResult = {
    val finalSession = sumSession(playerJs.session, (SecureMode, playerJs.isSecure.toString))
    super.result.withSession(finalSession)
  }
}

private[launcher] object ItemEditors extends LaunchCompanionUtils {
  def apply(playerConfig: V2PlayerConfig, rh: RequestHeader): ItemEditors = {
    ItemEditors(url(playerConfig, rh), resourceToString(_), params(rh))
  }
}

private[launcher] case class ItemEditors(corespringUrl: String, builder: JsBuilder, queryParams: Map[String, String]) extends CorespringJsClient {
  override lazy val fileNames: Seq[String] = Seq("item-editor.js", "draft.js", "draft-editor.js")
  override lazy val bootstrap: String =
    """
      |org.corespring.players.ItemEditor = corespring.require('item-editor');
      |org.corespring.players.DraftEditor = corespring.require('draft-editor');
      |
    """.stripMargin

  import org.corespring.container.client.controllers.apps.routes.{ DraftDevEditor => DraftDevEditorRoutes, DraftEditor => DraftEditorRoutes, ItemDevEditor => ItemDevEditorRoutes, ItemEditor => ItemEditorRoutes }
  import org.corespring.container.client.controllers.resources.routes.{ Item => ItemRoutes, ItemDraft => ItemDraftRoutes }
  override def options: JsObject = obj(
    "paths" -> obj(
      "itemEditor" -> obj(
        "editor" -> ItemEditorRoutes.load(":itemId"),
        "devEditor" -> ItemDevEditorRoutes.load(":itemId"),
        "createItem" -> ItemRoutes.create()),
      "draftEditor" -> obj(
        "editor" -> DraftEditorRoutes.load(":draftId"),
        "devEditor" -> DraftDevEditorRoutes.load(":draftId"),
        "createItemAndDraft" -> ItemDraftRoutes.createItemAndDraft(),
        "commitDraft" -> ItemDraftRoutes.commit(":draftId"),
        "save" -> ItemDraftRoutes.save(":draftId"))))
}

private[launcher] object ComponentEditor extends LaunchCompanionUtils {
  def apply(playerConfig: V2PlayerConfig, rh: RequestHeader, builder: JsBuilder): ComponentEditor = {
    ComponentEditor(url(playerConfig, rh), builder, params(rh))
  }
}

private[launcher] case class ComponentEditor(corespringUrl: String, builder: JsBuilder, queryParams: Map[String, String]) extends CorespringJsClient {

  override val fileNames = Seq("draft.js", "component-editor.js")

  override val bootstrap =
    """
      |var modules = corespring.require('component-editor');
      |org.corespring.players.ComponentEditor = modules.Standalone;
      |org.corespring.players.ItemComponentEditor = modules.Item;
      |org.corespring.players.DraftComponentEditor = modules.Draft;
    """.stripMargin

  private object r {
    import org.corespring.container.client.controllers.{ apps, resources }
    val componentEditor = apps.routes.ComponentEditor
    val itemEditor = apps.routes.ItemEditor
    val draftEditor = apps.routes.DraftEditor
    val item = resources.routes.Item
    val draft = resources.routes.ItemDraft
  }

  override lazy val options: JsObject = obj(
    "paths" -> obj(
      "standaloneEditor" -> r.componentEditor.load(":componentType"),
      "itemEditor" -> obj(
        "singleComponent" -> obj(
          "createWithSingleComponent" -> r.item.createWithSingleComponent(":componentType"),
          "loadData" -> r.item.load(":itemId"),
          "loadEditor" -> r.itemEditor.componentEditor(":itemId"),
          "upload" -> r.itemEditor.uploadFile(":itemId", ":filename"),
          "saveComponents" -> r.item.saveSubset(":itemId", "components"))),
      "draftEditor" -> obj(
        "singleComponent" -> obj(
          "createWithSingleComponent" -> r.draft.createWithSingleComponent(":componentType"),
          "commit" -> r.draft.commit(":draftId"),
          "loadData" -> r.draft.load(":draftId"),
          "loadEditor" -> r.draftEditor.componentEditor(":draftId"),
          "upload" -> r.draftEditor.uploadFile(":draftId", ":filename"),
          "saveComponents" -> r.draft.saveSubset(":draftId", "components")))))
}