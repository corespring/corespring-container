package org.corespring.container.client.controllers.resources

import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import org.corespring.container.client.controllers.helpers.{ PlayerXhtml, XhtmlProcessor }
import org.corespring.container.components.model.Component
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.{ JsString, JsObject, JsValue, Json }
import play.api.mvc._
import scalaz.Scalaz._
import scalaz._

import scala.concurrent.{ ExecutionContext, Future }

object ItemDraft {
  object Errors {
    val noJson = "No json in request body"
    val unknownSubset = "unknown subset"
    val errorSaving = "Error Saving"
    val invalidXhtml = "Invalid xhtml"
  }
}

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

  def componentTypes: Seq[String]

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

trait ItemDraft extends Controller {

  private lazy val logger = ContainerLogger.getLogger("Item")

  implicit def toResult(m: StatusMessage): SimpleResult = play.api.mvc.Results.Status(m._1)(Json.obj("error" -> m._2))

  implicit def ec: ExecutionContext

  /**
   * A list of all the component types in the container
   * @return
   */
  protected def componentTypes: Seq[String]

  def hooks: ItemDraftHooks

  def create(itemId: String) = Action.async {
    implicit request =>
      hooks.create(itemId).map {
        either =>
          either match {
            case Left(sm) => sm
            case Right(id) => Ok(Json.obj("id" -> id))
          }
      }
  }

  def cleanUpRawItemJson(rawItem: JsValue): JsValue = ItemJson(componentTypes, rawItem)

  def load(draftId: String) = Action.async {
    implicit request =>
      hooks.load(draftId).map {
        either =>
          either match {
            case Left(sm) => sm
            case Right(draft) => Ok(cleanUpRawItemJson(draft \ "item"))
          }
      }
  }

  def commit(draftId: String) = Action.async { implicit request =>
    hooks.commit(draftId).map { e =>
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
      case "supporting-materials" => hooks.saveSupportingMaterials(_: String, json)
      case "xhtml" => (json \ "xhtml")
        .asOpt[String]
        .map { s =>
          val validXhtml = XhtmlProcessor.toWellFormedXhtml(s)
          hooks.saveXhtml(_: String, validXhtml)
        }
        .getOrElse(missingProperty("xhtml"))
      case "summary-feedback" => (json \ "summaryFeedback").asOpt[String].map(s => hooks.saveSummaryFeedback(_: String, s)).getOrElse(missingProperty("summaryFeedback"))
      case "profile" => hooks.saveProfile(_: String, json)
      case "components" => hooks.saveComponents(_: String, json)
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
