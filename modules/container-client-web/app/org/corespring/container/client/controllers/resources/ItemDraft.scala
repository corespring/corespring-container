package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks._
import play.api.Logger
import play.api.libs.json.{ Json }
import play.api.mvc._
import scala.concurrent.{Future, ExecutionContext}

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

  def save(draftId: String) = Action.async { implicit request: Request[AnyContent] =>
    request.body.asJson match {
      case Some(json) => hooks.save(draftId, json).map { _ match {
        case Left(sm) => sm
        case Right(json) => Ok(json)
      }}
      case _ => Future { BadRequest(Json.obj("error" -> ItemDraft.Errors.noJson)) }
    }
  }

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
