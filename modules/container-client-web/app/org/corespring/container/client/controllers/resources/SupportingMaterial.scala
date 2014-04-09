package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions.SupportingMaterialActions
import play.api.mvc.{Controller, AnyContent}
import play.api.libs.json.{JsValue, Json}

trait SupportingMaterial extends Controller {

  def actions: SupportingMaterialActions[AnyContent]

  def create(itemId: String) = actions.create(itemId) { request =>
    request.body.asJson match {
      case Some(json: JsValue) => request.save(itemId, json) match {
        case Left(jsonResult: JsValue) => Ok(Json.prettyPrint(jsonResult))
        case Right(error: String) => BadRequest(error)
      }
      case _ => BadRequest("Request body did not contain JSON.")
    }
  }

}
