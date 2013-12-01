package org.corespring.shell.impl.controllers

import java.io.File
import org.corespring.container.client.views.txt.js.ServerLibraryWrapper
import org.corespring.shell.impl.services.MongoService
import play.api.Play.current
import play.api.http.ContentTypes
import play.api.libs.json.JsObject
import play.api.libs.json.JsString
import play.api.libs.json.{Json, JsValue}
import play.api.mvc._
import play.api.{Play, Logger}

trait Main extends Controller {

  import org.corespring.shell.impl.views._

  val logger = Logger("shell.home")

  def itemService: MongoService

  def sessionService: MongoService

  def index = Action {
    request =>

      val items: Seq[(String, String, String, String)] = itemService.list("metadata.title").map {
        json: JsValue =>
          val name = (json \ "metadata" \ "title").as[String]
          val id = (json \ "_id" \ "$oid").as[String]
          val playerUrl = routes.Main.createSessionPage(id).url
          val editorUrl = s"/client/editor/${id}/index.html"
          (name, id, playerUrl, editorUrl)
      }
      logger.debug(items.mkString(","))
      Ok(html.index(items))
  }

  def createSessionPage(itemId: String) = Action {
    request =>
      val createSessionCall = routes.Main.createSession
      Ok(html.createSession(itemId, createSessionCall.url))
  }

  def createSession = Action {
    request =>

      logger.debug("create session....")
      val result = for {
        json <- request.body.asJson
        saved <- sessionService.create(json)
      } yield {
        logger.debug(Json.stringify(json))
        saved
      }

      result.map {
        oid =>
          Ok(JsObject(Seq("url" -> JsString(s"/client/player/${oid.toString}/index.html"))))
      }.getOrElse {
        logger.debug("Can't create the session")
        BadRequest("Create session - where's the body?")
      }
  }

  val SecureMode = "corespring.player.secure"

  def isSecure(r:Request[AnyContent]) = r.getQueryString("secure").map{ _ == "true"}.getOrElse(false)


  //TODO: Move to container-client-web or its own module - as we'll be reusing this
  def playerJs = Action{ request =>

    val defaultOptions =
      """
        |exports.corespringUrl = "http://localhost:9000";
        |exports.itemPath = "/client/item/:id/player";
        |exports.sessionPath = "/client/player/:id/index.html";
        |exports.mode = "gather";
        |
      """.stripMargin

    val rawJs = Seq("container-client/js/corespring/core-library.js")
    val wrappedJs = Seq(
      "container-client/js/player-launcher/new-external-player.js",
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
    val wrappedNameAndContents = wrappedJs.map(pathToNameAndContents) :+("defaultOptions", defaultOptions)
    val wrappedContents = wrappedNameAndContents.map(tuple => ServerLibraryWrapper(tuple._1, tuple._2))

    val bootstrap =
      s"""
        |window.org = window.org || {};
        |org.corespring = org.corespring || {};
        |org.corespring.players = org.corespring.players || {};
        |org.corespring.players.ItemPlayer = corespring.require("new-external-player").define(${isSecure(request)});
        |
      """.stripMargin
    Ok(
      (contents ++ wrappedContents :+ bootstrap).mkString("\n")
    ).as(ContentTypes.JAVASCRIPT).withSession((SecureMode, isSecure(request).toString))
  }
}
