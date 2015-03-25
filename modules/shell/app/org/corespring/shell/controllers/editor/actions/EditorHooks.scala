package org.corespring.shell.controllers.editor.actions

import org.corespring.container.client.controllers.{ AssetType, Assets }
import org.corespring.container.client.hooks.{ EditorHooks => ContainerEditorHooks, UploadResult }
import org.corespring.container.logging.ContainerLogger
import org.corespring.mongo.json.services.MongoService
import play.api.libs.json.JsValue
import play.api.mvc._

import scala.concurrent.Future

trait EditorHooks extends ContainerEditorHooks {

  lazy val logger = ContainerLogger.getLogger("EditorHooks")

  def draftItemService: MongoService

  def assets: Assets

  import play.api.http.Status._

  override def load(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future{
    draftItemService.load(id).map { json =>
      Right(json)
    }.getOrElse(Left(NOT_FOUND -> id))
  }

  override def deleteFile(id: String, path: String)(implicit header: RequestHeader): Future[Option[(Int, String)]] = assets.delete(AssetType.Draft, id, path)(header)

  override def upload(draftId: String, file: String)(predicate: (RequestHeader) => Option[SimpleResult]): BodyParser[Future[UploadResult]] = {

    def shellPredicate(rh: RequestHeader): Option[SimpleResult] = {
      predicate(rh).orElse {
        if (rh.getQueryString("fail").exists(_ == "true")) {
          Some(Results.BadRequest("Fail is in the queryString"))
        } else {
          None
        }
      }
    }
    assets.upload(AssetType.Draft, draftId, file)(shellPredicate)
  }
  override def loadFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult = assets.load(AssetType.Draft, id, path)(request)

}

