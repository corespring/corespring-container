package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks._
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.ComponentSplitter
import play.api.Logger
import play.api.libs.json.{JsObject}
import play.api.libs.json.Json._
import play.api.mvc._
import scala.concurrent.{Future}

object ItemDraft {
  object Errors {
    val noJson = "No json in request body"
    val unknownSubset = "unknown subset"
    val errorSaving = "Error Saving"
    val invalidXhtml = "Invalid xhtml"
  }
}

trait ItemDraft extends CoreItem with ComponentSplitter{

  override lazy val logger = Logger(classOf[ItemDraft])

  def components : Seq[Component]

  def createItemAndDraft = Action.async {
    implicit request =>
      hooks.createItemAndDraft.map { either =>
        either match {
          case Left(sm) => sm
          case Right((itemId, draftName)) => Ok(obj("itemId" -> itemId, "draftName" -> draftName))
        }
      }
  }

  def createWithSingleComponent(componentType:String) = Action.async { implicit request =>

    val defaultData = interactions
      .find(_.componentType == componentType)
      .map { _.defaultData }
      .flatMap{ case o : JsObject => Some(o); case _ => None }

    defaultData.map{ d =>
      hooks.createSingleComponentItemDraft(componentType, SingleComponent.Key, d).map { either =>
        either match {
          case Left(sm) => toResult(sm)
          case Right((itemId, draftName)) => Created(obj("itemId" -> itemId, "draftName" -> draftName))
        }
      }
    }.getOrElse(Future.successful(NotFound(obj("error" -> s"unknown componentType: $componentType"))))
  }

  override def hooks: CoreItemHooks with DraftHooks

  def save(draftId: String) = Action.async { implicit request: Request[AnyContent] =>
    request.body.asJson match {
      case Some(json) => hooks.save(draftId, json).map { _ match {
        case Left(sm) => sm
        case Right(json) => Ok(json)
      }}
      case _ => Future { BadRequest(obj("error" -> ItemDraft.Errors.noJson)) }
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
