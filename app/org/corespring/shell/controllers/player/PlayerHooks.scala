package org.corespring.shell.controllers.player

import org.corespring.container.client.actions.ClientHooksActionBuilder
import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.actions.SessionIdRequest
import org.corespring.container.client.controllers.hooks.{PlayerHooks =>ContainerPlayerHooks}
import org.corespring.mongo.json.services.MongoService
import play.api.libs.json._
import play.api.mvc.{Action, Result, AnyContent}
import scala.Some
import scalaz.Scalaz._
import scalaz._

trait PlayerHooks extends ContainerPlayerHooks {

  def itemService : MongoService
  def sessionService : MongoService

  def builder: ClientHooksActionBuilder[AnyContent] = new ClientHooksActionBuilder[AnyContent] {

    private def toItemId(json: JsValue): Option[String] = (json \ "itemId").asOpt[String]

    private def load(id:String)(block: (PlayerRequest[AnyContent] => Result)) : Action[AnyContent] = Action{ request =>
      val playerRequest: Validation[String, PlayerRequest[AnyContent]] = for {
        s <- sessionService.load(id).toSuccess(s"can't find session with id: $id")
        itemId <- toItemId(s).toSuccess(s"error converting string to item id: $s")
        i <- itemService.load(itemId).toSuccess(s"can't load item with id: $itemId")
      } yield {
          PlayerRequest(i, request, Some(s))
        }

      playerRequest match {
        case Failure(msg) => BadRequest(Json.obj("error" -> JsString(msg)))
        case Success(r) => block(r)
      }
    }

    def loadComponents(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = load(id)(block)

    def loadServices(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = load(id)(block)

    def loadConfig(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = load(id)(block)

    def createSessionForItem(itemId: String)(block: (SessionIdRequest[AnyContent]) => Result): Action[AnyContent] = Action{ request =>

      val settings = Json.obj(
        "maxNoOfAttempts" -> JsNumber(2),
        "showFeedback" -> JsBoolean(true),
        "highlightCorrectResponse" -> JsBoolean(true),
        "highlightUserResponse" -> JsBoolean(true),
        "isFinished" -> JsBoolean(false)
      )

      val session = Json.obj("settings" -> settings, "itemId" -> JsString(itemId), "attempts" -> JsNumber(0))

      sessionService.create(session).map{ oid =>
        block(SessionIdRequest(oid.toString, request))
      }.getOrElse(BadRequest("Error creating session"))
    }
  }

}
