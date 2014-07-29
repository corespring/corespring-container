package org.corespring.container.client.controllers

import java.io.{File, InputStream}

import org.apache.commons.lang3.StringEscapeUtils
import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.controllers.player.PlayerQueryStringOptions
import org.corespring.container.client.hooks.{PlayerJs, PlayerLauncherHooks}
import org.corespring.container.client.views.txt.js.ServerLibraryWrapper
import play.api.Play
import play.api.Play.current
import play.api.http.ContentTypes
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._

import scala.concurrent.ExecutionContext


trait PlayerLauncher extends Controller with PlayerQueryStringOptions{

  def playerConfig: V2PlayerConfig

  implicit def ec: ExecutionContext

  //TODO: This is lifted from corespring-api -> move to a library
  object BaseUrl {
    def apply(r: Request[AnyContent]): String = {

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

  import org.corespring.container.client.controllers.apps.routes.{BasePlayer, Editor, ProdHtmlPlayer}

  val SecureMode = "corespring.player.secure"

  def hooks: PlayerLauncherHooks

  def editorJs = Action.async { implicit request =>
    hooks.editorJs.map { implicit js =>

      val rootUrl = playerConfig.rootUrl.getOrElse(BaseUrl(request))
      val itemEditorUrl = s"${Editor.editItem(":itemId")}"

      val create = org.corespring.container.client.controllers.resources.routes.Item.create()

      val defaultOptions: JsValue = Json.obj(
        "corespringUrl" -> rootUrl,
        "paths" -> Json.obj(

          "editor" -> Json.obj(
            "method" -> Editor.editItem(":itemId").method,
            "url" -> itemEditorUrl),

          "create" -> Json.obj(
            "method" -> create.method,
            "url" -> create.url)))
      val jsPath = "container-client/js/player-launcher/editor.js"
      val bootstrap = "org.corespring.players.ItemEditor = corespring.require('editor');"
      make(jsPath, defaultOptions, bootstrap)
    }
  }

  /**
   * query: playerPage the player page to load (default: index.html), for a simple player you can pass in container-player.html
   */
  def playerJs = Action.async { implicit request =>
    hooks.playerJs.map { implicit js =>

      val sessionIdPlayerUrl = isProdPlayer match {
        case true => ProdHtmlPlayer.config(":id").url
        case _ => BasePlayer.loadPlayerForSession(":id")
      }

      val rootUrl = playerConfig.rootUrl.getOrElse(BaseUrl(request))

      val itemUrl : String = BasePlayer.createSessionForItem(":id").url
        .setPlayerPage(getPlayerPage)
        .setProdPlayer(isProdPlayer)

      val defaultOptions: JsValue = Json.obj(
        "corespringUrl" -> rootUrl,
        "mode" -> "gather",
        "paths" -> Json.obj(
          "gather" -> itemUrl,
          "gatherSession" -> s"$sessionIdPlayerUrl?mode=gather",
          "view" -> s"$sessionIdPlayerUrl?mode=view",
          "evaluate" -> s"$sessionIdPlayerUrl?mode=evaluate"))
      val jsPath = "container-client/js/player-launcher/player.js"
      val bootstrap = s"org.corespring.players.ItemPlayer = corespring.require('player').define(${js.isSecure});"
      make(jsPath, defaultOptions, bootstrap)
    }
  }

  private def pathToNameAndContents(p: String) = {
    import grizzled.file.GrizzledFile._
    Play.resource(p).map {
      r =>
        val name = new File(r.getFile).basename.getName.replace(".js", "")
        val contents = scala.io.Source.fromInputStream(r.getContent().asInstanceOf[InputStream]).getLines.mkString("\n")
        (name, contents)
    }.getOrElse {
      throw new RuntimeException(s"Can't find resource for path: $p")
    }
  }

  private def make(jsPath: String, options: JsValue, bootstrapLine: String)(implicit request: Request[AnyContent], js: PlayerJs): SimpleResult = {
    val defaultOptions = ("default-options" -> s"module.exports = ${Json.stringify(options)}")
    val launchErrors = ("launcher-errors" -> errorsToModule(js.errors))
    val rawJs = Seq("container-client/js/corespring/core-library.js")
    val wrappedJs = jsPath +: Seq(
      "container-client/js/player-launcher/errors.js",
      "container-client/js/player-launcher/post-message.js",
      "container-client/js/player-launcher/instance.js",
      "container-client/js/player-launcher/url-builder.js",
      "container-client/js/player-launcher/root-level-listener.js")

    val contents = rawJs.map(pathToNameAndContents(_)).map(_._2)
    val wrappedNameAndContents = wrappedJs.map(pathToNameAndContents) :+ defaultOptions :+ launchErrors
    val wrappedContents = wrappedNameAndContents.map(tuple => ServerLibraryWrapper(tuple._1, tuple._2))

    val bootstrap =
      s"""
        |window.org = window.org || {};
        |org.corespring = org.corespring || {};
        |org.corespring.players = org.corespring.players || {};
        |$bootstrapLine
        |
      """.stripMargin

    def sumSession(s: Session, keyValues: (String, String)*): Session = {
      keyValues.foldRight(s)((kv: (String, String), acc: Session) => acc + (kv._1, kv._2))
    }

    val finalSession = sumSession(js.session, (SecureMode, js.isSecure.toString))

    Ok(
      (contents ++ wrappedContents :+ bootstrap).mkString("\n")).as(ContentTypes.JAVASCRIPT).withSession(finalSession)
  }

  private def errorsToModule(errors: Seq[String]): String = {

    val cleaned = errors.map(StringEscapeUtils.escapeEcmaScript)

    s"""
     |exports.hasErrors = ${errors.length > 0};
     |exports.errors = ${if (errors.length == 0) "[];" else s"['${cleaned.mkString("','")}'];"}
     """.stripMargin
  }
}
