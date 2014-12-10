package org.corespring.shell.controllers.editor

import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks.{ ItemHooks => ContainerItemHooks }
import org.corespring.mongo.json.services.MongoService
import play.api.http.Status._
import play.api.libs.json.{ JsString, JsValue, Json }
import play.api.mvc._

import scala.concurrent.Future

trait ItemHooks extends ContainerItemHooks {

  def itemService: MongoService

  override def save(itemId: String, data: JsValue)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = {
    Future {
      itemService.save(itemId, data).map {
        json =>
          Right(json)
      }.getOrElse(Left(BAD_REQUEST -> "Error saving"))
    }
  }

  override def load(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = {
    Future {
      itemService.load(itemId).map {
        Right(_)
      }.getOrElse(Left(NOT_FOUND -> ""))
    }
  }

  override def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[StatusMessage, String]] = {
    Future {
      val newItem = Json.obj(
        "components" -> Json.obj(),
        "metadata" -> Json.obj(
          "title" -> JsString("Untitled")),
        "xhtml" -> "<div></div>")

      itemService.create(newItem).map {
        oid =>
          Right(oid.toString)
      }.getOrElse(Left(BAD_REQUEST -> "Error creating item"))
    }
  }

  override def fineGrainedSave(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = {
    Future {
      itemService.fineGrainedSave(itemId, json).map {
        json =>
          Right(json)
      }.getOrElse(Left(BAD_REQUEST -> "Error saving"))
    }
  }
}

