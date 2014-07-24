package org.corespring.shell.controllers

import play.api.Logger
import play.api.libs.json.JsObject
import play.api.libs.json.JsString
import play.api.libs.json.{Json, JsValue}
import play.api.mvc._
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.{IndexLink, SessionKeys}

trait Main extends Controller {

  import org.corespring.shell.views._
  import org.corespring.shell.controllers._

  val logger = Logger("shell.home")

  def itemService: MongoService

  def sessionService: MongoService

  def index = Action {
    request =>

      def failLoadPlayerForSession = request.getQueryString(SessionKeys.failLoadPlayer).isDefined

      val items: Seq[IndexLink] = itemService.list("profile.taskInfo.title").sortBy(_.toString).map {
        json: JsValue =>
          val name = (json \ "profile" \ "taskInfo" \ "title").asOpt[String] match {
            case Some(title) if title.trim().length() > 0 => title
            case _ => "No title"
          }
          val id = (json \ "_id" \ "$oid").as[String]
          val playerUrl = routes.Main.createSessionPage(id).url
          val editorUrl = s"/client/editor/${id}/index.html"
          val deleteUrl = s"/delete-item/$id"
          val catalogUrl = s"/client/item/$id/preview"
          IndexLink(name, playerUrl, editorUrl, deleteUrl, catalogUrl)
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
      val url = s"${createSessionCall.url}?${request.rawQueryString}"
      println(s"----> $url")

      Ok(html.createSession(itemId, url))
  }

  def deleteItem(itemId: String) = Action {
    request =>
      itemService.delete(itemId)
      Redirect("/")
  }

  def createItem = Action {
    request =>
      val json = Json.obj(
        "xhtml" -> "<div></div>",
        "components" -> Json.obj(),
        "profile" -> Json.obj(
          "taskInfo" -> Json.obj(
            "title" -> "")))
      itemService.create(json).map { id =>
        Redirect(org.corespring.container.client.controllers.apps.routes.Editor.editItem(id.toString))
      }.getOrElse(BadRequest("Error creating an item"))
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

          println(s"mode-----> ${request.rawQueryString}")
          println(request.queryString("mode").exists(_ == "prod"))

          val call = {
            if(request.queryString("mode").exists(_ == "prod")){
              org.corespring.container.client.controllers.apps.routes.ProdHtmlPlayer.config(oid.toString)
            } else {
              org.corespring.container.client.controllers.apps.routes.BasePlayer.loadPlayerForSession(oid.toString)
            }
          }
          println(s"url ${call.url}")
          Ok(JsObject(Seq("url" -> JsString(call.url))))
      }.getOrElse {
        logger.debug("Can't create the session")
        BadRequest("Create session - where's the body?")
      }
  }
}
