package org.corespring.container.client.actions

import play.api.mvc._

/**
 * Client side calls - each will call for config, services and components
 * @tparam A
 */
trait ClientHooksActionBuilder[A] {
  def loadComponents(id:String)(block: PlayerRequest[A] => Result ) : Action[AnyContent]
  def loadServices(id:String)(block: PlayerRequest[A] => Result ) : Action[AnyContent]
  def loadConfig(id:String)(block: PlayerRequest[A] => Result ) : Action[AnyContent]
  def createSessionForItem(itemId:String)(block: SessionIdRequest[A] => Result) : Action[AnyContent]
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

  /**
   * Load the item and the session return these to the `block` in a SubmitAnswersRequest
   * @param id
   * @param block
   * @return
   */
  def submitAnswers(id: String)(block: SubmitSessionRequest[A] => Result): Action[AnyContent]
  def save(id: String)(block: SaveSessionRequest[A] => Result): Action[AnyContent]
}