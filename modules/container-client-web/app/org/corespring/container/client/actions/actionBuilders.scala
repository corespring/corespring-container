package org.corespring.container.client.actions

import play.api.mvc._
import scala.concurrent.Future
import play.api.libs.json.{Json, JsValue}

/**
 * Client side calls - each will call for config, services and components
 * @tparam A
 */
trait ClientActions[A] {
  def loadComponents(id: String)(block: PlayerRequest[A] => Result): Action[AnyContent]

  def loadServices(id: String)(block: PlayerRequest[A] => Result): Action[AnyContent]

  def loadConfig(id: String)(block: PlayerRequest[A] => Result): Action[AnyContent]
}

trait PlayerActions[A] extends ClientActions[A] {
  def createSessionForItem(itemId: String)(block: SessionIdRequest[A] => Result): Action[AnyContent]

  def loadPlayerForSession(sessionId: String)(error: (Int, String) => Result)(block: Request[A] => Result): Action[AnyContent]
}

trait EditorActions[A] extends ClientActions[A] {
  def createItem(block: PlayerRequest[A] => Result): Action[AnyContent]

  def editItem(itemId: String)(error: (Int, String) => Future[SimpleResult])(block: PlayerRequest[A] => Future[SimpleResult]): Action[AnyContent]
}

trait CatalogActions[A] extends ClientActions[A] {
  def showCatalog(itemId: String)(error: (Int, String) => Future[SimpleResult])(block: PlayerRequest[A] => Future[SimpleResult]): Action[AnyContent]
}

case class HttpStatusMessage(status:Int,message:String = "")

trait ItemHooks {
  def load(itemId: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, JsValue]]
  def save(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, JsValue]]
  def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[HttpStatusMessage, String]]
}

trait SupportingMaterialActions[A] {
  def create(itemId: String)(block: NewSupportingMaterialRequest[A] => Result): Action[AnyContent]
}

trait SessionHooks {
  def loadEverything(id: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, FullSession]]
  def load(id: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, JsValue]]
  def loadOutcome(id: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, SessionOutcome]]
  def getScore(id: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, SessionOutcome]]
  def save(id: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, SaveSession]]
}

trait PlayerLauncherActions[A] {
  /**
   * Serve the player js that allows 3rd parties to run the player.
   * @param block
   * @return
   */
  def playerJs(block: PlayerJsRequest[A] => Result): Action[AnyContent]

  def editorJs(block: PlayerJsRequest[A] => Result): Action[AnyContent]
}

trait AssetActions[A] {
  def delete(itemId: String, file: String)(block: DeleteAssetRequest[A] => Result): Action[AnyContent]
  def upload(itemId: String, file: String)(block: Request[Int] => Result): Action[Int]
}