package org.corespring.shell.controllers.editor.actions

import scala.concurrent.Future

import org.corespring.container.client.hooks.{EditorHooks => ContainerEditorHooks, PlayerData}
import org.corespring.mongo.json.services.MongoService
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.{JsString, JsValue, Json}
import play.api.mvc._

trait EditorHooks extends ContainerEditorHooks {



  lazy val logger = ContainerLogger.getLogger("EditorHooks")

  def itemService: MongoService

  import play.api.http.Status._

  private def load(itemId: String)(implicit request: RequestHeader) = Future {
    itemService.load(itemId).map { json =>
      Right(json)
    }.getOrElse(Left(NOT_FOUND -> itemId))
  }

  override def loadItem(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = load(id)

  override def createItem(implicit header: RequestHeader) = Future {

    logger.debug("[createItem]")

    val newItem = Json.obj(
      "components" -> Json.obj(),
      "metadata" -> Json.obj(
        "title" -> JsString("New title")),
      "xhtml" -> "<div></div>")

    itemService.create(newItem).map {
      oid =>
        val item = newItem ++ Json.obj("_id" -> Json.obj("$oid" -> oid.toString))
        Right(PlayerData(item))
    }.getOrElse(Left(BAD_REQUEST -> "Error creating item"))
  }

}
