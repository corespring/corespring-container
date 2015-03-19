package org.corespring.shell.controllers.editor.actions

import scala.concurrent.Future

import org.corespring.container.client.hooks.{ EditorHooks => ContainerEditorHooks, PlayerData }
import org.corespring.mongo.json.services.MongoService
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.{ JsString, JsValue, Json }
import play.api.mvc._

trait EditorHooks extends ContainerEditorHooks {

  lazy val logger = ContainerLogger.getLogger("EditorHooks")

  def draftItemService : MongoService

  import play.api.http.Status._

  private def load(draftId: String)(implicit request: RequestHeader) = Future {
    draftItemService.load(draftId).map { json =>
      Right(json)
    }.getOrElse(Left(NOT_FOUND -> draftId))
  }

  override def loadItem(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = load(id)


}
