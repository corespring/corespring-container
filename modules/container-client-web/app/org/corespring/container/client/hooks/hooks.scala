package org.corespring.container.client.hooks

import org.corespring.container.client.HasContext
import org.corespring.container.client.hooks.Hooks.{ R, StatusMessage }
import play.api.libs.json.{ JsArray, JsValue }
import play.api.mvc._

import scala.concurrent.Future

object Hooks {
  type StatusMessage = (Int, String)
  type R[A] = Future[Either[StatusMessage, A]]
}
trait GetSupportingMaterialAssetHook {
  def loadSupportingMaterialFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult
}

trait GetAssetHook {
  def loadFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult
}

case class UploadResult(path: String)

trait AssetHooks extends GetAssetHook {
  def deleteFile(id: String, file: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]
  def upload(id: String, file: String)(predicate: RequestHeader => Option[SimpleResult]): BodyParser[Future[UploadResult]]
}

/**
 * Client side calls - each will call for config, services and components
 */
trait LoadHook extends HasContext {

  /**
   * load the item with the id into the editor, aka it will be read+write access.
   * If returning a status message - you can optionally return a SEE_OTHER status and it will be handled correctly
   * @param id
   * @param header
   * @return
   */
  def load(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
}

trait PlayerHooks extends GetAssetHook with HasContext {
  def createSessionForItem(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, (JsValue, JsValue)]]
  def loadSessionAndItem(sessionId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, (JsValue, JsValue)]]
  def loadItemFile(itemId: String, file: String)(implicit header: RequestHeader): SimpleResult
}

trait CatalogHooks extends LoadHook with GetAssetHook with GetSupportingMaterialAssetHook {
  def showCatalog(itemId: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]
}

/*trait ItemHooks extends HasContext {
  def load(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
  def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[StatusMessage, String]]
}*/

trait EditorHooks extends LoadHook with AssetHooks

trait SupportingMaterialHooks {
  def create[F<:File](id:String, sm:CreateNewMaterialRequest[F])(implicit h : RequestHeader) : R[JsValue]
  def delete(id:String, name:String)(implicit h : RequestHeader) : R[JsValue]
  def addAsset(id:String, name:String, binary: Binary)(implicit h : RequestHeader) : R[JsValue]
  def deleteAsset(id:String, name:String, filename:String)(implicit h : RequestHeader) : R[JsValue]
  def getAsset(id:String, name:String, filename:String)(implicit h : RequestHeader) : SimpleResult
}

trait CoreItemHooks extends HasContext with LoadHook {
  def delete(id: String)(implicit h: RequestHeader): R[JsValue]
  def saveCollectionId(id: String, collectionId: String)(implicit h: RequestHeader): R[JsValue]
  def saveComponents(id: String, json: JsValue)(implicit h: RequestHeader): R[JsValue]
  def saveCustomScoring(id: String, customScoring: String)(implicit header: RequestHeader): R[JsValue]
  def saveProfile(id: String, json: JsValue)(implicit h: RequestHeader): R[JsValue]
  def saveSummaryFeedback(id: String, feedback: String)(implicit h: RequestHeader): R[JsValue]
  def saveSupportingMaterials(id: String, json: JsValue)(implicit h: RequestHeader): R[JsValue]
  def saveXhtml(id: String, xhtml: String)(implicit h: RequestHeader): R[JsValue]
}

trait DraftHooks {
  def save(draftId: String, json: JsValue)(implicit request: RequestHeader): R[JsValue]
  def createItemAndDraft()(implicit h: RequestHeader): R[(String, String)]
  def commit(id: String, force: Boolean)(implicit h: RequestHeader): R[JsValue]
}

trait CreateItemHook {
  def createItem(json: Option[JsValue])(implicit h: RequestHeader): R[String]
}

trait SessionHooks extends HasContext {
  def getScore(id: String)(implicit header: RequestHeader): Either[StatusMessage, SessionOutcome]
  def load(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
  def loadItemAndSession(sessionId: String)(implicit header: RequestHeader): Either[StatusMessage, FullSession]
  def loadOutcome(id: String)(implicit header: RequestHeader): Either[StatusMessage, SessionOutcome]
  def save(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, SaveSession]]
}

trait PlayerLauncherHooks extends HasContext {
  def catalogJs(implicit header: RequestHeader): Future[PlayerJs]
  def editorJs(implicit header: RequestHeader): Future[PlayerJs]
  def playerJs(implicit header: RequestHeader): Future[PlayerJs]
}

trait DataQueryHooks extends HasContext {
  def list(topic: String, query: Option[String] = None)(implicit header: RequestHeader): Future[Either[StatusMessage, JsArray]]

  def findOne(topic: String, id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, Option[JsValue]]]
}

trait CollectionHooks extends HasContext {
  def list()(implicit header: RequestHeader): Future[Either[StatusMessage, JsArray]]
}