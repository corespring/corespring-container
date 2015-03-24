package org.corespring.container.client.hooks

import java.io.File

import com.amazonaws.services.s3.model.S3Object
import org.corespring.container.client.HasContext
import org.corespring.container.client.hooks.Hooks.StatusMessage
import play.api.libs.json.{ JsString, JsArray, JsValue }
import play.api.mvc._

import scala.concurrent.Future

object Hooks {
  type StatusMessage = (Int, String)
}

/**
 * Client side calls - each will call for config, services and components
 */
trait ClientHooks extends HasContext {

  /**
   * load the item with the id into the editor, aka it will be read+write access.
   * If returning a status message - you can optionally return a SEE_OTHER status and it will be handled correctly
   * @param id
   * @param header
   * @return
   */
  def loadItem(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
}

trait PlayerHooks extends ClientHooks with GetAssetHook {
  def createSessionForItem(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, String]]
  def loadSessionAndItem(sessionId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, (JsValue, JsValue)]]
}

trait EditorHooks extends ClientHooks with AssetHooks {
}

trait CatalogHooks extends ClientHooks with GetAssetHook {
  def showCatalog(itemId: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]
}

trait ItemHooks extends HasContext {
  def load(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
  def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[StatusMessage, String]]
}
trait ItemDraftHooks extends HasContext {

  type R[A] = Future[Either[StatusMessage, A]]

  def load(draftId: String)(implicit header: RequestHeader): R[JsValue]

  def saveProfile(draftId: String, json: JsValue)(implicit h: RequestHeader): R[JsValue]
  def saveSupportingMaterials(draftId: String, json: JsValue)(implicit h: RequestHeader): R[JsValue]
  def saveComponents(draftId: String, json: JsValue)(implicit h: RequestHeader): R[JsValue]
  def saveXhtml(draftId: String, xhtml: String)(implicit h: RequestHeader): R[JsValue]
  def saveSummaryFeedback(draftId: String, feedback: String)(implicit h: RequestHeader): R[JsValue]

  def create(itemId: String)(implicit h: RequestHeader): R[String]
  def commit(draftId: String, force: Boolean)(implicit h: RequestHeader): R[JsValue]
  def delete(draftId: String)(implicit h: RequestHeader): R[JsValue]
}

trait SessionHooks extends HasContext {

  def loadItemAndSession(sessionId: String)(implicit header: RequestHeader): Either[StatusMessage, FullSession]

  def loadOutcome(id: String)(implicit header: RequestHeader): Either[StatusMessage, SessionOutcome]

  def getScore(id: String)(implicit header: RequestHeader): Either[StatusMessage, SessionOutcome]

  def load(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def save(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, SaveSession]]
}

trait PlayerLauncherHooks extends HasContext {
  def playerJs(implicit header: RequestHeader): Future[PlayerJs]

  def editorJs(implicit header: RequestHeader): Future[PlayerJs]

  def catalogJs(implicit header: RequestHeader): Future[PlayerJs]
}

trait GetAssetHook extends {
  def loadFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult
}

case class UploadResult(path: String)

trait AssetHooks extends GetAssetHook {
  def deleteFile(id: String, file: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]
  def upload(id: String, file: String)(predicate: RequestHeader => Option[SimpleResult]): BodyParser[Future[UploadResult]]
}

trait DataQueryHooks extends HasContext {
  def list(topic: String, query: Option[String] = None)(implicit header: RequestHeader): Future[Either[StatusMessage, JsArray]]

  def findOne(topic: String, id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, Option[JsValue]]]
}
