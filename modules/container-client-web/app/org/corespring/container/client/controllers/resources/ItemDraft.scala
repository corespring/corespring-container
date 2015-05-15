package org.corespring.container.client.controllers.resources

import org.corespring.container.client.controllers.helpers.XhtmlProcessor
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._

import scala.concurrent.{ ExecutionContext, Future }
import scalaz.Scalaz._
import scalaz._

object ItemDraft {
  object Errors {
    val noJson = "No json in request body"
    val unknownSubset = "unknown subset"
    val errorSaving = "Error Saving"
    val invalidXhtml = "Invalid xhtml"
  }
}

trait ItemDraft extends Controller {

  private lazy val logger = ContainerLogger.getLogger("Item")

  implicit def toResult(m: StatusMessage): SimpleResult = play.api.mvc.Results.Status(m._1)(Json.obj("error" -> m._2))

  implicit def ec: ExecutionContext

  def createItemAndDraft = Action.async {
    implicit request =>
      hooks.createItemAndDraft.map { either =>
        either match {
          case Left(sm) => sm
          case Right((itemId, draftName)) => Ok(Json.obj("itemId" -> itemId, "draftName" -> draftName))
        }
      }
  }

  /**
   * A list of all the component types in the container
   * @return
   */
  protected def componentTypes: Seq[String]

  def hooks: ItemDraftHooks

  def load(draftId: String) = Action.async {
    implicit request =>
      hooks.load(draftId).map {
        either =>
          either match {
            case Left(sm) => sm
            case Right(draft) => Ok(ItemJson(componentTypes, draft \ "item")).withHeaders("Cache-Control" -> "no-cache, no-store, must-revalidate", "Expires" -> "0")
          }
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

  type SaveSig = String => Future[Either[(Int, String), JsValue]]

  def saveSubset(itemId: String, subset: String) = Action.async { implicit request: Request[AnyContent] =>

    logger.debug(s"function=saveSubset subset=$subset")
    def missingProperty(p: String) = (i: String) => Future(Left(BAD_REQUEST, s"Missing property $p in json request for $i"))

    def saveFn(subset: String, json: JsValue): Option[SaveSig] = Some(subset match {
      case "components" => hooks.saveComponents(_: String, json)
      case "collection-id" => (json \ "collectionId").asOpt[String].map(s => hooks.saveCollectionId(_: String, s)).getOrElse(missingProperty("collectionId"))
      case "custom-scoring" => (json \ "customScoring")
        .asOpt[String]
        .map(cs => hooks.saveCustomScoring(_: String, cs))
        .getOrElse(missingProperty("customScoring"))
      case "profile" => hooks.saveProfile(_: String, json)
      case "supporting-materials" => hooks.saveSupportingMaterials(_: String, json)
      case "summary-feedback" => (json \ "summaryFeedback").asOpt[String].map(s => hooks.saveSummaryFeedback(_: String, s)).getOrElse(missingProperty("summaryFeedback"))
      case "xhtml" => (json \ "xhtml")
        .asOpt[String]
        .map { s =>
          val validXhtml = XhtmlProcessor.toWellFormedXhtml(s)
          hooks.saveXhtml(_: String, validXhtml)
        }
        .getOrElse(missingProperty("xhtml"))

      case _ => (itemId: String) => Future(Left(BAD_REQUEST, s"Unknown subset: $subset"))
    })

    val out: Validation[String, Future[Either[StatusMessage, JsValue]]] = for {
      json <- request.body.asJson.toSuccess(ItemDraft.Errors.noJson)
      fn <- saveFn(subset, json).toSuccess(ItemDraft.Errors.unknownSubset)
      result <- Success(fn(itemId))
    } yield result

    out match {
      case Failure(msg) => Future(BadRequest(Json.obj("error" -> msg)))
      case Success(future) => {
        future.map {
          case Left(err) => Status(err._1)(Json.obj("error" -> err._2))
          case Right(json) => Ok(json)
        }
      }
    }
  }

}
