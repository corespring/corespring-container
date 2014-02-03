package org.corespring.container.client.controllers

import java.io.{InputStream, File}
import org.apache.commons.lang3.StringEscapeUtils
import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.actions.{PlayerJsRequest, PlayerLauncherActionBuilder}
import org.corespring.container.client.views.txt.js.ServerLibraryWrapper
import play.api.Play
import play.api.Play.current
import play.api.http.ContentTypes
import play.api.mvc.{Result, AnyContent, Request, Controller}
import play.api.libs.json.{Json, JsValue}


trait PlayerLauncher extends Controller {

  def playerConfig: V2PlayerConfig

  //TODO: This is lifted from corespring-api -> move to a library
  object BaseUrl {
    def apply(r: Request[AnyContent]): String = {

      /**
       * Note: You can't check a request to see if its http or not in Play
       * But even if you could you may be sitting behind a reverse proxy.
       * @see: https://groups.google.com/forum/?fromgroups=#!searchin/play-framework/https$20request/play-framework/11zbMtNI3A8/o4318Z-Ir6UJ
       *       but the tip was to check for the header below
       */
      val protocol = r.headers.get("x-forwarded-proto") match {
        case Some("https") => "https"
        case _ => "http"
      }

      protocol + "://" + r.host
    }
  }

  import org.corespring.container.client.controllers.hooks.routes.PlayerHooks
  import org.corespring.container.client.controllers.hooks.routes.EditorHooks
  import org.corespring.container.client.controllers.routes.Assets

  val SecureMode = "corespring.player.secure"

  def builder: PlayerLauncherActionBuilder[AnyContent]

  def editorJs = builder.editorJs {
    implicit request =>
      val rootUrl = playerConfig.rootUrl.getOrElse(BaseUrl(request))
      val itemEditorUrl = s"${EditorHooks.editItem(":itemId")}"
      val defaultOptions: JsValue = Json.obj(
        "corespringUrl" -> rootUrl,
        "path" -> itemEditorUrl)
      val jsPath = "container-client/js/player-launcher/editor.js"
      val bootstrap = "org.corespring.players.ItemEditor = corespring.require('editor');"
      make(jsPath, defaultOptions, bootstrap)
  }

  /**
   * query: playerPage the player page to load (default: index.html), for a simple player you can pass in container-player.html
   */
  def playerJs = builder.playerJs {
    implicit request =>

      val playerPage = request.getQueryString("playerPage").getOrElse("player.html")
      val rootUrl = playerConfig.rootUrl.getOrElse(BaseUrl(request))
      val itemUrl = s"${PlayerHooks.createSessionForItem(":id").url}?file=$playerPage"
      val sessionUrl = s"${Assets.session(":id", playerPage)}"

      val defaultOptions: JsValue = Json.obj(
        "corespringUrl" -> rootUrl,
        "mode" -> "gather",
        "paths" -> Json.obj(
          "gather" -> itemUrl,
          "view" -> s"$sessionUrl?mode=view",
          "evaluate" -> s"$sessionUrl?mode=evaluate"
        )
      )
      val jsPath = "container-client/js/player-launcher/player.js"
      val bootstrap = s"org.corespring.players.ItemPlayer = corespring.require('player').define(${request.isSecure});"
      make(jsPath, defaultOptions, bootstrap)
  }


  private def pathToNameAndContents(p: String) = {
    import grizzled.file.GrizzledFile._
    Play.resource(p).map {
      r =>
        val name = new File(r.getFile).basename.getName.replace(".js", "")
        val contents = scala.io.Source.fromInputStream(r.getContent().asInstanceOf[InputStream]).getLines.mkString("\n")
        (name, contents)
    }.getOrElse((p, ""))
  }

  private def make(jsPath: String, options: JsValue, bootstrapLine: String)(implicit request: PlayerJsRequest[AnyContent]): Result = {

    val defaultOptions = ("default-options", s"module.exports = ${Json.stringify(options)}")
    val launchErrors = ("launcher-errors", errorsToModule(request.errors))
    val rawJs = Seq("container-client/js/corespring/core-library.js")
    val wrappedJs = jsPath +: Seq(
      "container-client/js/player-launcher/errors.js",
      "container-client/js/player-launcher/instance.js",
      "container-client/js/player-launcher/root-level-listener.js"
    )

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
    Ok(
      (contents ++ wrappedContents :+ bootstrap).mkString("\n")
    ).as(ContentTypes.JAVASCRIPT).withSession(session +(SecureMode, request.isSecure.toString))
  }

  private def errorsToModule(errors: Seq[String]): String = {

    val cleaned = errors.map(StringEscapeUtils.escapeEcmaScript)

    s"""
     |exports.hasErrors = ${errors.length > 0};
     |exports.errors = ${if (errors.length == 0) "[];" else s"['${cleaned.mkString("','")}'];"}
     """.stripMargin
  }
}
