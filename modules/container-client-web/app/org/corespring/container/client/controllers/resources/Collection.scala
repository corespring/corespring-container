package org.corespring.container.client.controllers.resources

import org.corespring.container.client.HasContext
import org.corespring.container.client.hooks.CollectionHooks
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, Controller}

import scala.concurrent.ExecutionContext

/** Query service for collection objects */
trait Collection extends Controller with HasContext {

  def hooks: CollectionHooks

  implicit def ec: ExecutionContext

  /**
   * List all collections i do have access to.
   */
  def list(): Action[AnyContent] = Action.async { implicit request =>
    hooks.list().map {
      case Left((code, msg)) => Status(code)(Json.obj("error" -> msg))
      case Right(arr) => Ok(arr)
    }
  }
}