package org.corespring.container.client.controllers

import java.io.File
import org.corespring.container.client.views.txt.js.ServerLibraryWrapper
import play.api.Play
import play.api.Play.current
import play.api.http.ContentTypes
import play.api.mvc.{AnyContent, Request, Action, Controller}


trait PlayerLauncher extends Controller {

  val SecureMode = "corespring.player.secure"

  def isSecure(r:Request[AnyContent]) : Boolean

  //TODO: Move to container-client-web or its own module - as we'll be reusing this
  def playerJs = Action{ request =>

    val rootUrl = play.api.Play.current.configuration.getString("APP_ROOT_URL").getOrElse("http://localhost:9000")

    val defaultOptions =
      s"""
        |exports.corespringUrl = "$rootUrl";
        |exports.itemPath = "${org.corespring.container.client.controllers.hooks.routes.PlayerHooks.createSessionForItem(":id").url}";
        |exports.sessionPath = "${org.corespring.container.client.controllers.routes.Assets.session(":id", "index.html")}";
        |exports.mode = "gather";
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
          val contents = scala.io.Source.fromFile(r.getFile).getLines.mkString("\n")
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
        |org.corespring.players.ItemPlayer = corespring.require("player").define(${isSecure(request)});
        |
      """.stripMargin
    Ok(
      (contents ++ wrappedContents :+ bootstrap).mkString("\n")
    ).as(ContentTypes.JAVASCRIPT).withSession((SecureMode, isSecure(request).toString))
  }
}
