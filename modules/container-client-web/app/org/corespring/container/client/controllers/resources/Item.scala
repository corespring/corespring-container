package org.corespring.container.client.controllers.resources

import org.corespring.container.client.controllers.helpers.XhtmlProcessor
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.{ JsObject, JsValue, Json }
import play.api.mvc._
import scalaz.Scalaz._
import scalaz._

import scala.concurrent.{ ExecutionContext, Future }

object Item {
  object Errors {
    val noJson = "No json in request body"
    val unknownSubset = "unknown subset"
    val errorSaving = "Error Saving"
    val invalidXhtml = "Invalid xhtml"
  }
}

trait Item extends Controller {

  private lazy val logger = ContainerLogger.getLogger("Item")

  implicit def toResult(m: StatusMessage): SimpleResult = play.api.mvc.Results.Status(m._1)(Json.obj("error" -> m._2))

  implicit def ec: ExecutionContext

  def hooks: ItemHooks

  def create = Action.async {
    implicit request =>
      hooks.create(request.body.asJson).map {
        either =>
          either match {
            case Left(sm) => sm //Status(code)(Json.obj("error" -> msg))
            case Right(id) => Ok(Json.obj("itemId" -> id))
          }
      }
  }

  def cleanUpRawItemJson(rawItem: JsValue): JsValue = {
    val itemJson = rawItem.as[JsObject]

    def addItemIdAndRemoveDbGarbage = (itemJson \ "_id" \ "$oid").asOpt[String]
      .fold(rawItem)(itemId => itemJson - "_id" ++ Json.obj("itemId" -> Json.toJson(itemId)))

    (itemJson \ "itemId").asOpt[String].fold(addItemIdAndRemoveDbGarbage)(_ => rawItem)
  }

  def load(itemId: String) = Action.async {
    implicit request =>
      hooks.load(itemId).map {
        either =>
          either match {
            case Left(sm) => sm
            case Right(rawItem) => Ok(cleanUpRawItemJson(rawItem))
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
        .map(xhtml => hooks.saveXhtml(_: String, xhtml))
        .getOrElse(missingProperty("xhtml"))
      case "summary-feedback" => (json \ "summaryFeedback").asOpt[String].map(s => hooks.saveSummaryFeedback(_: String, s)).getOrElse(missingProperty("summaryFeedback"))
      case "profile" => hooks.saveProfile(_: String, json)
      case "components" => hooks.saveComponents(_: String, json)
      case _ => (itemId: String) => Future(Left(BAD_REQUEST, s"Unknown subset: $subset"))
    })

    val out: Validation[String, Future[Either[StatusMessage, JsValue]]] = for {
      json <- request.body.asJson.toSuccess(Item.Errors.noJson)
      fn <- saveFn(subset, json).toSuccess(Item.Errors.unknownSubset)
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
