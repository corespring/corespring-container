package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.{ CoreItemHooks, CreateItemHook }
import org.corespring.container.components.model.{Interaction, Component}
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.mvc.{ Action, _ }

import scala.concurrent.Future

trait Item extends CoreItem {

  def hooks: CoreItemHooks with CreateItemHook

  def components : Seq[Component]

  def createWithSingleComponent = Action.async { implicit request =>
    request.body.asJson.map { json =>
      (json \ "componentType").asOpt[String].map { ct =>

        logger.info(s"function=createWithSingleComponent, componentType=$ct")
        println(s"function=createWithSingleComponent, componentType=$ct")

        val defaultData = components
          .find(_.componentType == ct)
          .map { case Interaction(_,_,_,_,_,_,_,_,_,defaultData,_,_,_) => defaultData }
          .getOrElse(Json.obj("config" -> Json.obj(), "componentType" -> ct))
          .asInstanceOf[JsObject]

        logger.debug(s"function=createWithSingleComponent, componentType=$ct, defaultData=$defaultData")

        hooks.createSingleComponentItem(ct, defaultData).map { either =>
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
