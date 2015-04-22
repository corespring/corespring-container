package org.corespring.container.client.controllers.resources

import org.corespring.container.client.controllers.helpers.PlayerXhtml
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks.ItemHooks
import play.api.libs.json.{JsObject, JsString, JsValue, Json}
import play.api.mvc.{Action, Controller, SimpleResult}

import scala.concurrent.ExecutionContext

object ItemJson {

  def apply(components: Seq[String], rawJson: JsValue): JsObject = {

    val processedXhtml = (rawJson \ "xhtml").asOpt[String].map(s => PlayerXhtml.mkXhtml(components, s)).getOrElse {
      throw new IllegalArgumentException("the Item json must contain 'xhtml'")
    }

    val itemId = (rawJson \ "_id" \ "$oid").asOpt[JsString].map(id => Json.obj("itemId" -> id)).getOrElse(Json.obj())
    rawJson.as[JsObject] + ("xhtml" -> JsString(processedXhtml)) ++ itemId
  }
}

trait Item extends Controller {

  implicit def toResult(m: StatusMessage): SimpleResult = play.api.mvc.Results.Status(m._1)(Json.obj("error" -> m._2))

  def hooks: ItemHooks

  /**
   * A list of all the component types in the container
   * @return
   */
  protected def componentTypes: Seq[String]

  implicit def ec: ExecutionContext

  def load(itemId: String) = Action.async { implicit request =>
    hooks.load(itemId).map {
      either =>
        either match {
          case Left(sm) => sm
          case Right(rawItem) => Ok(ItemJson(componentTypes, rawItem))
        }
    }
  }

  def create = Action.async {
    implicit request =>
      hooks.create(request.body.asJson).map {
        either =>
          either match {
            case Left(sm) => sm
            case Right(id) => Ok(Json.obj("itemId" -> id))
          }
      }
  }
}
