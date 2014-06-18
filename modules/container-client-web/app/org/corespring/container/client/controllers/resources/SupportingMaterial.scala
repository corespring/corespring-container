package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions.SupportingMaterialHooks
import play.api.mvc.{ Action, Controller }

import scala.concurrent.{ ExecutionContext, Future }

trait SupportingMaterial extends Controller {

  def hooks: SupportingMaterialHooks

  implicit def ec: ExecutionContext

  def create(itemId: String) = Action.async {
    implicit request =>
      request.body.asJson.map { json =>
        hooks.create(itemId).map { e =>
          e match {
            case Left((code, msg)) => Status(code)(msg)
            case Right(nsm) => {
              nsm.save(itemId, json) match {
                case Left(err) => BadRequest(err)
                case Right(json) => Ok(json)
              }
            }
          }
        }
      }.getOrElse(Future(BadRequest("Request body did not contain json")))
  }

}
