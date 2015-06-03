package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks._
import play.api.Logger
import play.api.libs.json.{ Json }
import play.api.mvc._
import scala.concurrent.{ ExecutionContext }

object ItemDraft {
  object Errors {
    val noJson = "No json in request body"
    val unknownSubset = "unknown subset"
    val errorSaving = "Error Saving"
    val invalidXhtml = "Invalid xhtml"
  }
}

trait ItemDraft extends CoreItem {

  override lazy val logger = Logger(classOf[ItemDraft])

  def createItemAndDraft = Action.async {
    implicit request =>
      hooks.createItemAndDraft.map { either =>
        either match {
          case Left(sm) => sm
          case Right((itemId, draftName)) => Ok(Json.obj("itemId" -> itemId, "draftName" -> draftName))
        }
      }
  }

  override def hooks: CoreItemHooks with DraftHooks

  /*def load(draftId: String) = Action.async {
    implicit request =>
      hooks.load(draftId).map {
        either =>
          either match {
            case Left(sm) => sm
            case Right(draft) => Ok(ItemJson(componentTypes, draft \ "item")).withHeaders("Cache-Control" -> "no-cache, no-store, must-revalidate", "Expires" -> "0")
          }
      }
  }*/

  def commit(draftId: String) = Action.async { implicit request =>
    val force = request.getQueryString("force").exists(_ == "true")
    hooks.commit(draftId, force).map { e =>
      e match {
        case Left(sm) => sm
        case Right(json) => Ok(json)
      }
    }
  }


}
