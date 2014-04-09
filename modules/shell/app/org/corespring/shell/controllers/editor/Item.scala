package org.corespring.shell.controllers.editor

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

  override def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[(Int, String), String]] = {
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

