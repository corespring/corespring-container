package org.corespring.container.client.controllers.launcher

import org.corespring.container.client.{ HasContainerContext, V2PlayerConfig }
import org.corespring.container.client.hooks.{ PlayerJs, PlayerLauncherHooks }
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.logging.ContainerLogger
import play.api.http.ContentTypes
import play.api.libs.json.{ JsObject, Json }
import play.api.mvc.{ Session, _ }

import scala.concurrent.ExecutionContext

trait Launcher extends Controller with HasContainerContext {

  def playerConfig: V2PlayerConfig

  lazy val logger = ContainerLogger.getLogger("PlayerLauncher")

  //TODO: This is lifted from corespring-api -> move to a library
  object BaseUrl {
    def apply(r: RequestHeader): String = {

      /**
       * Note: You can't check a request to see if its http or not in Play
       * But even if you could you may be sitting behind a reverse proxy.
       * see: https://groups.google.com/forum/?fromgroups=#!searchin/play-framework/https$20request/play-framework/11zbMtNI3A8/o4318Z-Ir6UJ
       * but the tip was to check for the header below
       */
      val protocol = r.headers.get("x-forwarded-proto") match {
        case Some("https") => "https"
        case _ => "http"
      }

      protocol + "://" + r.host
    }
  }

  import JsResource._
  import org.corespring.container.client.controllers.apps.routes.{ Catalog, DraftDevEditor, DraftEditor, ItemDevEditor, ItemEditor, Player }
  import org.corespring.container.client.controllers.resources.routes.Item
  def hooks: PlayerLauncherHooks


  object NameAndSrc {

    private def mk(name:String) = {
      val jsPath = s"container-client/js/player-launcher/$name.js"
      pathToNameAndContents(jsPath)
    }

    lazy val itemEditor = mk("item-editor")
    lazy val componentEditor = mk("component-editor")
    lazy val draftEditor = mk("draft-editor")
    lazy val catalog = mk("catalog")
    lazy val player = mk("player")
  }

  implicit def callToJson(c: Call): JsObject = Json.obj("method" -> c.method, "url" -> c.url)

  object Definitions {
    def player(isSecure: Boolean) = s"org.corespring.players.ItemPlayer = corespring.require('player').define($isSecure);"
    val itemEditor = "org.corespring.players.ItemEditor = corespring.require('item-editor');"
    val singleComponentEditor = "org.corespring.players.SingleComponentEditor = corespring.require('component-editor');"
    val draftEditor = "org.corespring.players.DraftEditor = corespring.require('draft-editor');"
    val catalog = "org.corespring.players.ItemCatalog = corespring.require('catalog');"

    val editors =
      s"""
         |$itemEditor
         |$draftEditor
         |$singleComponentEditor
       """.stripMargin
  }

  def mkPaths(paths: JsObject) = Json.obj("paths" -> paths)

  object Paths {

    import org.corespring.container.client.controllers.resources.routes.ItemDraft

    val catalog = JsObject(Seq("catalog" -> Catalog.load(":itemId")))

    val draftEditor = JsObject(Seq(
      "editor" -> DraftEditor.load(":draftId"),
      "devEditor" -> DraftDevEditor.load(":draftId"),
      "createItemAndDraft" -> ItemDraft.createItemAndDraft(),
      "commitDraft" -> ItemDraft.commit(":draftId"),
      "save" -> ItemDraft.save(":draftId")))

    val itemEditor = JsObject(Seq(
      "editor" -> ItemEditor.load(":itemId"),
      "devEditor" -> ItemDevEditor.load(":itemId"),
      "createItem" -> Item.create(),
      "singleComponent" -> JsObject(Seq(
        "create" -> Item.createWithSingleComponent(),
        "load" -> ItemEditor.loadSingleComponent(":itemId")
      ))))

    val player = {
      val loadSession = Player.load(":sessionId")
      JsObject(Seq(
        "createSession" -> Player.createSessionForItem(":id"),
        "gather" -> loadSession,
        "view" -> loadSession,
        "evaluate" -> loadSession))
    }

    val editors = Json.obj(
      "itemEditor" -> itemEditor,
      "draftEditor" -> draftEditor)
  }

  val SecureMode = "corespring.player.secure"

  protected def sumSession(s: Session, keyValues: (String, String)*): Session = keyValues.foldRight(s) { case ((key, value), acc) => acc + (key -> value) }

  protected def make(additionalJsNameAndSrc: Seq[(String, String)], options: JsObject, bootstrapLine: String)(implicit request: RequestHeader, js: PlayerJs): SimpleResult = {
    val corespringUrl = playerConfig.rootUrl.getOrElse(BaseUrl(request))
    val builder = new JsBuilder(corespringUrl)
    val finalSession = sumSession(js.session, (SecureMode, js.isSecure.toString))

    Ok(builder.build(additionalJsNameAndSrc, options, bootstrapLine)(request, js))
      .as(ContentTypes.JAVASCRIPT)
      .withSession(finalSession)
  }

  protected def make(additionalJsNameAndSrc: (String, String), options: JsObject, bootstrapLine: String)(implicit request: RequestHeader, js: PlayerJs): SimpleResult = {
    make(Seq(additionalJsNameAndSrc), options, bootstrapLine)
  }

}
