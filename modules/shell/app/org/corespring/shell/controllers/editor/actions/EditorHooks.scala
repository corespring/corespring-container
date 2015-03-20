package org.corespring.shell.controllers.editor.actions

import org.corespring.container.client.controllers.{ AssetType, Assets }

import scala.concurrent.Future

import org.corespring.container.client.hooks.{ EditorHooks => ContainerEditorHooks, PlayerData }
import org.corespring.mongo.json.services.MongoService
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.{ JsString, JsValue, Json }
import play.api.mvc._

trait EditorHooks extends ContainerEditorHooks {

  lazy val logger = ContainerLogger.getLogger("EditorHooks")

  def draftItemService: MongoService

  def assets: Assets

  import play.api.http.Status._

  private def load(draftId: String)(implicit request: RequestHeader) = Future {
    draftItemService.load(draftId).map { json =>
      Right(json)
    }.getOrElse(Left(NOT_FOUND -> draftId))
  }

  override def loadItem(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = load(id)
  override def deleteFile(id: String, path: String)(implicit header: RequestHeader): Future[Option[(Int, String)]] = assets.delete(AssetType.Draft, id, path)(header)
  override def uploadAction(id: String, file: String)(block: (Request[Int]) => SimpleResult): Action[Int] = assets.upload(AssetType.Draft, id, file)(block)
  override def loadFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult = assets.load(AssetType.Draft, id, path)(request)
}

