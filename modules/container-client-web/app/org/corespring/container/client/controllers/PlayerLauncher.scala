package org.corespring.container.client.controllers

import java.io.{InputStream, File}
import org.corespring.container.client.views.txt.js.ServerLibraryWrapper
import play.api.Play
import play.api.Play.current
import play.api.http.ContentTypes
import play.api.mvc.{AnyContent, Request, Action, Controller}
import org.corespring.container.client.actions.PlayerLauncherActionBuilder


trait PlayerLauncher extends Controller {

  //TODO: This is lifted from corespring-api -> move to a library
  object BaseUrl {
    def apply(r: Request[AnyContent]): String = {

      /**
       * Note: You can't check a request to see if its http or not in Play
       * But even if you could you may be sitting behind a reverse proxy.
       * @see: https://groups.google.com/forum/?fromgroups=#!searchin/play-framework/https$20request/play-framework/11zbMtNI3A8/o4318Z-Ir6UJ
       * but the tip was to check for the header below
       */
      val protocol = r.headers.get("x-forwarded-proto") match {
        case Some("https") => "https"
        case _ => "http"
      }

      protocol + "://" + r.host
    }
  }

  import org.corespring.container.client.controllers.hooks.routes.PlayerHooks
  import org.corespring.container.client.controllers.routes.Assets

  val SecureMode = "corespring.player.secure"

  def builder : PlayerLauncherActionBuilder[AnyContent]
  /**
   * query: playerPage the player page to load (default: index.html), for a simple player you can pass in container-player.html
   */
  def playerJs = builder.playerJs{ request =>

    val playerPage = request.getQueryString("playerPage").getOrElse("index.html")

    val rootUrl = play.api.Play.current.configuration.getString("APP_ROOT_URL").getOrElse( BaseUrl(request) )

    val itemUrl = s"${PlayerHooks.createSessionForItem(":id").url}?file=$playerPage"
    val sessionUrl = s"${Assets.session(":id", playerPage)}"

    val defaultOptions =
      s"""
        |exports.corespringUrl = "$rootUrl";
        |exports.itemPath = "$itemUrl";
        |exports.sessionPath = "$sessionUrl";
        |exports.mode = "gather";
        |exports.paths = {
        |  gather: "$itemUrl",
        |  view: "$sessionUrl?mode=view",
        |  evaluate: "$sessionUrl?mode=evaluate"
        |};

      """.stripMargin

    val rawJs = Seq("container-client/js/corespring/core-library.js")
    val wrappedJs = Seq(
      "container-client/js/player-launcher/player.js",
      "container-client/js/player-launcher/player-errors.js",
      "container-client/js/player-launcher/player-instance.js",
      "container-client/js/player-launcher/root-level-listener.js"
    )

    def pathToNameAndContents(p: String) = {
      import grizzled.file.GrizzledFile._
      Play.resource(p).map {
        r =>
          val name = new File(r.getFile).basename.getName.replace(".js", "")
          val contents = scala.io.Source.fromInputStream(r.getContent().asInstanceOf[InputStream]).getLines.mkString("\n")
          (name, contents)
      }.getOrElse((p, ""))
    }

    val contents = rawJs.map(pathToNameAndContents(_)).map(_._2)
    val wrappedNameAndContents = wrappedJs.map(pathToNameAndContents) :+ ("default-options", defaultOptions)
    val wrappedContents = wrappedNameAndContents.map(tuple => ServerLibraryWrapper(tuple._1, tuple._2))

    val bootstrap =
      s"""
        |window.org = window.org || {};
        |org.corespring = org.corespring || {};
        |org.corespring.players = org.corespring.players || {};
        |org.corespring.players.ItemPlayer = corespring.require("player").define(${request.isSecure});
        |
      """.stripMargin
    Ok(
      (contents ++ wrappedContents :+ bootstrap).mkString("\n")
    ).as(ContentTypes.JAVASCRIPT).withSession( request.session + (SecureMode, request.isSecure.toString))
  }
}
