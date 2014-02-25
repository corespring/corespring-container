package org.corespring.shell.controllers

import play.api.Logger
import play.api.libs.json.JsObject
import play.api.libs.json.JsString
import play.api.libs.json.{ Json, JsValue }
import play.api.mvc._
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.SessionKeys

trait Main extends Controller {

  import org.corespring.shell.views._
  import org.corespring.shell.controllers._

  val logger = Logger("shell.home")

  def itemService: MongoService

  def sessionService: MongoService

  def index = Action {
    request =>

      def failLoadPlayerForSession = request.getQueryString(SessionKeys.failLoadPlayer).isDefined

      val items: Seq[(String, String, String, String)] = itemService.list("metadata.title").sortBy(_.toString).map {
        json: JsValue =>
          val name = (json \ "metadata" \ "title").as[String]
          val id = (json \ "_id" \ "$oid").as[String]
          val playerUrl = routes.Main.createSessionPage(id).url
          val editorUrl = s"/client/editor/${id}/index.html"
          (name, id, playerUrl, editorUrl)
      }

      logger.debug(items.mkString(","))
      val r: Result = Ok(html.index(items))

      if (failLoadPlayerForSession)
        r.withSession(SessionKeys.failLoadPlayer -> "true")
      else
        r.withNewSession
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
          val call = org.corespring.container.client.controllers.routes.Assets.session(oid.toString, "container-player.html")
          Ok(JsObject(Seq("url" -> JsString(call.url))))
      }.getOrElse {
        logger.debug("Can't create the session")
        BadRequest("Create session - where's the body?")
      }
  }
}
