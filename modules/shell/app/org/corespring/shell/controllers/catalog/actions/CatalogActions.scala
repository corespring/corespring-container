package org.corespring.shell.controllers.catalog.actions

import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.actions.SessionIdRequest
import org.corespring.container.client.actions.EditorActions
import org.corespring.container.client.actions.{ CatalogActions => ContainerCatalogActions }
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.SessionKeys
import play.api.Logger
import play.api.libs.json.JsString
import play.api.libs.json.Json
import play.api.mvc.Results._
import play.api.mvc._
import scala.concurrent.{ ExecutionContext, Future }
import org.corespring.mongo.json.services.MongoService
import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.actions.SessionIdRequest
import org.corespring.shell.SessionKeys

trait CatalogActions extends ContainerCatalogActions[AnyContent] {

  import ExecutionContext.Implicits.global

  lazy val logger = Logger("catalog.hooks.action.builder")

  def itemService: MongoService

  private def load(itemId: String)(block: (PlayerRequest[AnyContent] => Result)): Action[AnyContent] = Action {
    request =>

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

  override def showCatalog(itemId: String)(error: (Int, String) => Future[SimpleResult])(block: (PlayerRequest[AnyContent]) => Future[SimpleResult]): Action[AnyContent] = Action.async {
    r =>
      r.session.get(SessionKeys.failLoadPlayer).map {
        fail =>
          error(1001, "Some error occurred")
      }.getOrElse {
        logger.debug(s"[editItem] $itemId")
        itemService.load(itemId).map {
          item =>
            block(PlayerRequest(item, r))
        }.getOrElse {
          Future(NotFound(s"Can't find item with id: $itemId"))
        }
      }
  }

}
