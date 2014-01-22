package org.corespring.container.client.actions

import play.api.libs.json.{JsString, Json}
import play.api.mvc.Results.BadRequest
import play.api.mvc._
import scala.concurrent.Future

/**
 * Client side calls - each will call for config, services and components
 * @tparam A
 */
trait ClientHooksActionBuilder[A] {
  def loadComponents(id:String)(block: PlayerRequest[A] => Result ) : Action[AnyContent]
  def loadServices(id:String)(block: PlayerRequest[A] => Result ) : Action[AnyContent]
  def loadConfig(id:String)(block: PlayerRequest[A] => Result ) : Action[AnyContent]
}

trait PlayerHooksActionBuilder[A] extends ClientHooksActionBuilder[A]{
  def createSessionForItem(itemId:String)(block: SessionIdRequest[A] => Result) : Action[AnyContent]
  def loadPlayerForSession(sessionId:String)(error: (Int,String) => Result)(block: Request[A] => Result) : Action[AnyContent]
}

trait EditorClientHooksActionBuilder[A] extends ClientHooksActionBuilder[A]{
  def createItem(block:PlayerRequest[A] => Result) : Action[AnyContent]
}

trait ItemActionBuilder[A] {
  def load(itemId:String)(block: ItemRequest[A] => Result ) : Action[AnyContent]
  def save(itemId:String)(block: SaveItemRequest[A] => Result ) : Action[AnyContent]
  def getScore(itemId: String)(block: ScoreItemRequest[A] => Result): Action[AnyContent]
}


trait SessionActionBuilder[A]{
  def loadEverything(id:String)(block: FullSessionRequest[A] => Result) : Action[AnyContent]
  def load(id:String)(block: FullSessionRequest[A] => Result) : Action[AnyContent]
  def loadOutcome(id:String)(block: SessionOutcomeRequest[A] => Result) : Action[AnyContent]

  /**
   * Load the item and the session return these to the `block` in a SubmitAnswersRequest
   * @param id
   * @param block
   * @return
   */
  def submitAnswers(id: String)(block: SubmitSessionRequest[A] => Result): Action[AnyContent]
  def save(id: String)(block: SaveSessionRequest[A] => Result): Action[AnyContent]
}

trait PlayerLauncherActionBuilder[A]{
  /**
   * Serve the player js that allows 3rd parties to run the player.
   * @param block
   * @return
   */
  def playerJs(block: PlayerJsRequest[A] => Result) : Action[AnyContent]
}