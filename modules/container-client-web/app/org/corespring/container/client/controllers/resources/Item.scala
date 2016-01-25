package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.{ CoreItemHooks, CreateItemHook }
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.{ Action, _ }

import scala.concurrent.Future

trait Item extends CoreItem {

  def hooks: CoreItemHooks with CreateItemHook

  def createWithSingleComponent = Action.async { implicit request =>
    request.body.asJson.map { json =>
      (json \ "componentType").asOpt[String].map { ct =>
        hooks.createSingleComponentItem(ct).map { either =>
          either match {
            case Left(sm) => toResult(sm)
            case Right(id) => Ok(Json.obj("itemId" -> id))
          }
        }
      }.getOrElse {
        Future(BadRequest(Json.obj("error" -> "You must specify a 'componentType'")))
      }
    }.getOrElse {
      Future(BadRequest(Json.obj("error" -> "No json in request body - must be: { \"componentType\": \"...\"} ")))
    }
  }

  def create = Action.async { implicit request =>
    createItem(request.body.asJson)
  }

  private def createItem(json: Option[JsValue])(implicit rh: RequestHeader): Future[SimpleResult] = {
    hooks.createItem(json).map {
      either =>
        either match {
          case Left(sm) => sm
          case Right(id) => Ok(Json.obj("itemId" -> id))
        }
    }
  }

}
