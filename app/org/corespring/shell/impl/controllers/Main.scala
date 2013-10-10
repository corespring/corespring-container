package org.corespring.shell.impl.controllers

import org.corespring.shell.impl.services.MongoService
import play.api.Logger
import play.api.libs.json.{Json, JsString, JsObject, JsValue}
import play.api.mvc.{Action, Controller}


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
}
