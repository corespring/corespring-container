package org.corespring.container.client.actions

import play.api.mvc._

trait ClientHooksActionBuilder[A] {
  def loadComponents(id:String)(block: PlayerRequest[A] => Result ) : Action[AnyContent]
  def loadServices(id:String)(block: PlayerRequest[A] => Result ) : Action[AnyContent]
  def loadConfig(id:String)(block: PlayerRequest[A] => Result ) : Action[AnyContent]
}


trait ItemActionBuilder[A] {
  def load(itemId:String)(block: ItemRequest[A] => Result ) : Action[AnyContent]
  def save(itemId:String)(block: SaveItemRequest[A] => Result ) : Action[AnyContent]
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
  def submitAnswers(id: String)(block: SubmitAnswersRequest[A] => Result): Action[AnyContent]
}