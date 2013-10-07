package org.corespring.shell.impl.controllers.editor

import org.corespring.container.client.actions.{SessionIdRequest, PlayerRequest, ClientHooksActionBuilder}
import org.corespring.shell.impl.services.MongoService
import play.api.mvc.{Action, Result, AnyContent}
import org.corespring.container.client.controllers.hooks.EditorHooks

trait EditorHooksImpl extends EditorHooks {

  def itemService : MongoService

  def builder: ClientHooksActionBuilder[AnyContent] = new ClientHooksActionBuilder[AnyContent] {

    private def load(itemId:String)(block: (PlayerRequest[AnyContent] => Result)) : Action[AnyContent] = Action{ request =>

      val playerRequest: Option[PlayerRequest[AnyContent]] = for {
        i <- itemService.load(itemId)
      } yield {
        PlayerRequest(i, request, None)
      }
      playerRequest.map(block(_)).getOrElse(BadRequest("Error loading play action"))
    }

    def loadComponents(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = load(id)(block)

    def loadServices(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = load(id)(block)

    def loadConfig(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = load(id)(block)

    def createSessionForItem(itemId: String)(block: (SessionIdRequest[AnyContent]) => Result): Action[AnyContent] = Action(BadRequest("Not supported"))
  }
}
