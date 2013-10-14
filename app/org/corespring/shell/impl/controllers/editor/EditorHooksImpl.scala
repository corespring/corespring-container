package org.corespring.shell.impl.controllers.editor

import org.corespring.container.client.actions.{EditorClientHooksActionBuilder, SessionIdRequest, PlayerRequest}
import org.corespring.shell.impl.services.MongoService
import play.api.mvc.{Request, Action, Result, AnyContent}
import org.corespring.container.client.controllers.hooks.EditorHooks
import play.api.libs.json.{JsString, Json}
import org.bson.types.ObjectId

trait EditorHooksImpl extends EditorHooks {

  def itemService : MongoService

  def builder: EditorClientHooksActionBuilder[AnyContent] = new EditorClientHooksActionBuilder[AnyContent] {

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

    def createItem(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = Action { request : Request[AnyContent] =>
      val id = ObjectId.get

      val newItem = Json.obj(
        "components" -> Json.obj(),
        "metadata" -> Json.obj(
          "title" -> JsString("New title")
        ),
        "xhtml" -> "<div><h1>I'm a new item</h1></div>"
      )

      itemService.create( newItem ).map{ oid =>
        val item = newItem ++ Json.obj("_id" -> Json.obj("$oid" -> oid.toString))
        block(PlayerRequest(item, request))
      }.getOrElse(BadRequest("Error creating item"))
    }
  }
}
