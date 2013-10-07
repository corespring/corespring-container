package org.corespring.shell.impl.controllers.player

import org.corespring.container.client.actions.ClientHooksActionBuilder
import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.actions.SessionIdRequest
import org.corespring.container.client.controllers.hooks.PlayerHooks
import org.corespring.shell.impl.services.MongoService
import play.api.libs.json._
import play.api.mvc.{Action, Result, AnyContent}
import scala.Some

trait PlayerHooksImpl extends PlayerHooks {

  def itemService : MongoService
  def sessionService : MongoService

  def builder: ClientHooksActionBuilder[AnyContent] = new ClientHooksActionBuilder[AnyContent] {

    private def toItemId(json: JsValue): Option[String] = (json \ "itemId").asOpt[String]

    private def load(id:String)(block: (PlayerRequest[AnyContent] => Result)) : Action[AnyContent] = Action{ request =>
        val playerRequest: Option[PlayerRequest[AnyContent]] = for {
          s <- sessionService.load(id)
          itemId <- toItemId(s)
          i <- itemService.load(itemId)
        } yield {
          PlayerRequest(i, request, Some(s))
        }
        playerRequest.map(block(_)).getOrElse(BadRequest("Error loading play action"))
    }

    def loadComponents(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = load(id)(block)

    def loadServices(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = load(id)(block)

    def loadConfig(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = load(id)(block)

    def createSessionForItem(itemId: String)(block: (SessionIdRequest[AnyContent]) => Result): Action[AnyContent] = Action{ request =>

      val session = Json.obj(
        "itemId" -> JsString(itemId),
        "maxNoOfAttempts" -> JsNumber(2),
        "showFeedback" -> JsBoolean(true),
        "showCorrectResponse" -> JsBoolean(true),
        "showUserResponse" -> JsBoolean(true),
        "isFinished" -> JsBoolean(false)
      )

      sessionService.create(session).map{ oid =>
        block(SessionIdRequest(oid.toString, request))
      }.getOrElse(BadRequest("Error creating session"))
    }
  }

}
