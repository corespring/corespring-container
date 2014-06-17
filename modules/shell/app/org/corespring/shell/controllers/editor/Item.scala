package org.corespring.shell.controllers.editor

import org.corespring.container.client.actions.{HttpStatusMessage, ItemHooks => ContainerItemHooks}
import org.corespring.mongo.json.services.MongoService
import play.api.http.Status._
import play.api.libs.json.{JsString, JsValue, Json}
import play.api.mvc._

import scala.concurrent.Future

trait ItemHooks extends ContainerItemHooks {

  import scala.concurrent.ExecutionContext.Implicits.global

  def itemService: MongoService

  override def save(itemId: String, data: JsValue)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, JsValue]] = {
    Future {
      itemService.save(itemId, data).map {
        json =>
          Right(json)
      }.getOrElse(Left(HttpStatusMessage(BAD_REQUEST,"Error saving")))
    }
  }

  override def load(itemId: String)(implicit header: RequestHeader): Future[Either[HttpStatusMessage, JsValue]] = {
    Future {
      itemService.load(itemId).map {
        Right(_)
      }.getOrElse(Left(HttpStatusMessage(NOT_FOUND)))
    }
  }

  override def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[HttpStatusMessage, String]] = {
    Future {
      val newItem = Json.obj(
        "components" -> Json.obj(),
        "metadata" -> Json.obj(
          "title" -> JsString("New title")),
        "xhtml" -> "<div></div>")

      itemService.create(newItem).map {
        oid =>
          Right(oid.toString)
      }.getOrElse(Left(HttpStatusMessage(BAD_REQUEST, "Error creating item")))
    }
  }
}

