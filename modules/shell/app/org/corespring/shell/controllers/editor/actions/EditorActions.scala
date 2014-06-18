package org.corespring.shell.controllers.editor.actions

import org.corespring.container.client.actions.Hooks.StatusMessage
import org.corespring.container.client.actions.{ PlayerData, EditorHooks => ContainerEditorHooks }
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.SessionKeys
import play.api.Logger
import play.api.libs.json.{ JsString, JsValue, Json }
import play.api.mvc._

import scala.concurrent.Future

trait EditorHooks extends ContainerEditorHooks {

  import scala.concurrent.ExecutionContext.Implicits.global

  lazy val logger = Logger("editor.hooks.action.builder")

  def itemService: MongoService

  import play.api.http.Status._

  private def load(itemId: String)(implicit request: RequestHeader) = Future {
    itemService.load(itemId).map { json =>
      Right(json)
    }.getOrElse(Left(NOT_FOUND -> itemId))
  }

  override def loadComponents(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = load(id)

  override def loadServices(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = load(id)

  override def loadConfig(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = load(id)

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

  override def editItem(itemId: String)(implicit header: RequestHeader): Future[Option[StatusMessage]] = Future(None)

}
