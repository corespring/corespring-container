package org.corespring.shell.controllers

import com.mongodb.DBObject
import com.mongodb.casbah.MongoCollection
import com.mongodb.casbah.commons.MongoDBObject
import org.bson.types.ObjectId
import org.corespring.container.client.hooks.ItemHooks
import org.corespring.container.logging.ContainerLogger
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.services.ItemDraftService
import org.corespring.shell.{DraftLink, IndexLink, SessionKeys}
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._

trait Main
  extends Controller {

  import org.corespring.shell.views._

  val logger = ContainerLogger.getLogger("Main")

  def items: MongoCollection

  def itemDrafts: ItemDraftService

  def sessionService: MongoService

  def itemHooks: ItemHooks

  def index = Action {
    request =>

      def failLoadPlayerForSession = request.getQueryString(SessionKeys.failLoadPlayer).isDefined

      val links: Seq[IndexLink] = items.find(
        MongoDBObject(),
        MongoDBObject("profile.taskInfo.title" -> 1)).toSeq.map {
        dbo: DBObject =>

          val name = try {
            dbo.get("profile").asInstanceOf[DBObject]
              .get("taskInfo").asInstanceOf[DBObject]
              .get("title").asInstanceOf[String]
          } catch {
            case _: Throwable => "No title"
          }

          val itemId = dbo.get("_id").asInstanceOf[ObjectId]

          import org.corespring.shell.controllers.routes.Launchers

          val draftUrls = itemDrafts.collection.find(MongoDBObject("_id.itemId" -> itemId)).map{ draft =>
            val id = draft.get("_id").asInstanceOf[DBObject]
            val itemId = id.get("itemId").asInstanceOf[ObjectId]
            val draftName = id.get("name").asInstanceOf[String]
            val draftId = s"$itemId~$draftName"
            val editDraftUrl = Launchers.editorFromDraft(draftId).url
            DraftLink(draftName, editDraftUrl, routes.Main.deleteDraft(draftId).url)
          }.toSeq

          import org.corespring.container.client.controllers.apps.{routes => appRoutes}
          val id = itemId.toString
          val playerUrl = routes.Main.createSessionPage(id).url
          val deleteUrl = routes.Main.deleteItem(id).url
          val editorUrl = Launchers.editorFromItem(id).url
          val devEditorUrl = appRoutes.DevEditor.load(id).url
          val catalogUrl = Launchers.catalog(id).url
          IndexLink(name,
            playerUrl,
            editorUrl,
            devEditorUrl,
            draftUrls,
            deleteUrl,
            catalogUrl)
      }

      logger.debug(items.mkString(","))
      val r: Result = Ok(html.index(links))

      if (failLoadPlayerForSession)
        r.withSession(SessionKeys.failLoadPlayer -> "true")
      else
        r.withNewSession
  }

  def createSessionPage(itemId: String) = Action {
    implicit request =>
      val createSessionCall = routes.Main.createSession
      val url = createSessionCall.url

      println(s"------> ${request.rawQueryString}")
      val finalUrl: String = s"$url?${request.rawQueryString}"
      Ok(html.createSession(itemId, finalUrl))
  }

  def deleteDraft(draftId: String) = Action {
    request =>
      itemDrafts.delete(draftId)
      Redirect("/")
  }

  def deleteItem(itemId: String) = Action {
    request =>
      items.remove(MongoDBObject("_id" -> new ObjectId(itemId)))
      Redirect("/")
  }

  def createItem = Action.async {
    request =>
      import org.corespring.shell.controllers.routes.Launchers
      import scala.concurrent.ExecutionContext.Implicits.global
      itemHooks.create(None)(request).map {
        case Left(err) => BadRequest("Error creating item")
        case Right(id) => Redirect(Launchers.editorFromItem(id.toString))
      }
  }

  def createSession = Action {
    implicit request =>

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
          val call = org.corespring.container.client.controllers.apps.routes.Player.load(oid.toString)
          logger.debug(s"url ${call.url}")
          val url = s"${call.url}?${request.rawQueryString}"
          Ok(Json.obj("url" -> url))
      }.getOrElse {
        logger.debug("Can't create the session")
        BadRequest("Create session - where's the body?")
      }
  }
}
