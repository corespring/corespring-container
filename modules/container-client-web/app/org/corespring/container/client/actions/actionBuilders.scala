package org.corespring.container.client.actions

import play.api.mvc._
import scala.concurrent.Future
import play.api.libs.json.JsValue

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

//Note: move to this pattern - instead of action decorators
trait ItemHooks {
  def load(itemId: String)(implicit header: RequestHeader): Future[Either[SimpleResult, JsValue]]
  def save(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[SimpleResult, JsValue]]
  def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[(Int, String), String]]
}

trait ItemActions[A] {
  def load(itemId: String)(block: ItemRequest[A] => Result): Action[AnyContent]

  @deprecated("Use ItemHooks.save instead", "3.2")
  def save(itemId: String)(block: SaveItemRequest[A] => Result): Action[AnyContent]

  def create(error: (Int, String) => Result)(block: NewItemRequest[A] => Result): Action[AnyContent]
}

trait SupportingMaterialActions[A] {
  def create(itemId: String)(block: NewSupportingMaterialRequest[A] => Result): Action[AnyContent]
}

trait SessionActions[A] {
  def loadEverything(id: String)(block: FullSessionRequest[A] => Result): Action[AnyContent]

  def load(id: String)(block: FullSessionRequest[A] => Result): Action[AnyContent]

  def loadOutcome(id: String)(block: SessionOutcomeRequest[A] => Result): Action[AnyContent]

  def getScore(id: String)(block: SessionOutcomeRequest[A] => Result): Action[AnyContent]

  /**
   * Load the item and the session return these to the `block` in a SubmitAnswersRequest
   * @param id
   * @param block
   * @return
   */
  def submitAnswers(id: String)(block: SubmitSessionRequest[A] => Result): Action[AnyContent]

  def save(id: String)(block: SaveSessionRequest[A] => Result): Action[AnyContent]
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