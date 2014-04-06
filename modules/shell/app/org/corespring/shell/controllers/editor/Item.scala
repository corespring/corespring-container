package org.corespring.shell.controllers.editor

import org.corespring.container.client.actions.ItemRequest
import org.corespring.container.client.actions.NewItemRequest
import org.corespring.container.client.actions.SaveItemRequest
import org.corespring.container.client.actions.{ ItemActions => ContainerItemActions }
import org.corespring.container.client.actions.{ ItemHooks => ContainerItemHooks }
import org.corespring.mongo.json.services.MongoService
import play.api.http.Status.BAD_REQUEST
import play.api.libs.json.JsString
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.Results._
import play.api.mvc._
import scala.concurrent.{ ExecutionContext, Future }

trait ItemHooks extends ContainerItemHooks {

  import ExecutionContext.Implicits.global

  def itemService: MongoService

  override def save(itemId: String, data: JsValue)(implicit header: RequestHeader): Future[Either[SimpleResult, JsValue]] = {
    Future {
      itemService.save(itemId, data).map {
        json =>
          Right(json)
      }.getOrElse(Left(BadRequest("Error saving")))
    }
  }

  override def load(itemId: String)(implicit header: RequestHeader): Future[Either[SimpleResult, JsValue]] = {
    Future {
      itemService.load(itemId).map {
        Right(_)
      }.getOrElse(Left(NotFound))
    }
  }

  override def create(implicit header: RequestHeader): Future[Either[(Int, String), String]] = {
    Future {
      val newItem = Json.obj(
        "components" -> Json.obj(),
        "metadata" -> Json.obj(
          "title" -> JsString("New title")),
        "xhtml" -> "<div></div>")

      itemService.create(newItem).map {
        oid =>
          Right(oid.toString)
      }.getOrElse(Left(BAD_REQUEST, "Error creating item"))
    }
  }
}

trait ItemActions extends ContainerItemActions[AnyContent] {
  def itemService: MongoService

  override def load(itemId: String)(block: (ItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
    request =>
      itemService.load(itemId).map {
        item =>
          block(ItemRequest(item, request))
      }.getOrElse(NotFound(s"Can't find item with id $itemId"))
  }

  override def save(itemId: String)(block: (SaveItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
    request =>
      BadRequest("See ItemHooks.save")
  }

  override def create(error: (Int, String) => Result)(block: (NewItemRequest[AnyContent]) => Result): Action[AnyContent] = Action {
    request =>

      val newItem = Json.obj(
        "components" -> Json.obj(),
        "metadata" -> Json.obj(
          "title" -> JsString("New title")),
        "xhtml" -> "<div></div>")

      itemService.create(newItem).map {
        oid =>
          block(NewItemRequest(oid.toString, request))
      }.getOrElse(error(BAD_REQUEST, "Error creating item"))
  }

}

