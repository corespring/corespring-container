package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.{ CoreItemHooks, CreateItemHook }
import org.corespring.container.components.model.{Interaction, Component}
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.libs.json.Json._
import play.api.mvc.{ Action, _ }

import scala.concurrent.Future

trait Item extends CoreItem {

  def hooks: CoreItemHooks with CreateItemHook

  def components : Seq[Component]

  def createWithSingleComponent(componentType:String) = Action.async { implicit request =>

    val defaultData = components
      .find(_.componentType == componentType)
      .map { case Interaction(_,_,_,_,_,_,_,_,_,defaultData,_,_,_) => defaultData }
      .map{ case o : JsObject => o }

    defaultData.map{ d =>
      hooks.createSingleComponentItem(componentType, d).map { either =>
        either match {
          case Left(sm) => toResult(sm)
          case Right(id) => Created(Json.obj("itemId" -> id))
        }
      }
    }.getOrElse(Future.successful(NotFound(obj("error" -> s"unknown componentType: $componentType"))))
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
