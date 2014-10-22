package org.corespring.container.client.controllers.resources

import com.fasterxml.jackson.annotation.JsonValue
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import org.corespring.container.client.controllers.helpers.XhtmlCleaner
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.{JsUndefined, JsObject, JsValue, Json}
import play.api.mvc._

import scala.concurrent.{ ExecutionContext, Future }

object Item {
  object Errors {
    val noJson = "No json in request body"
    val errorSaving = "Error Saving"
    val invalidXhtml = "Invalid xhtml"
  }
}

trait Item extends Controller with XhtmlCleaner {

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

  def cleanUpRawItemJson(rawItem:JsValue):JsValue = {
    val itemJson = rawItem.as[JsObject]

    def addItemIdAndRemoveDbGarbage = (itemJson \ "_id" \ "$oid").asOpt[String]
      .fold(rawItem) (itemId => itemJson - "_id" ++ Json.obj("itemId" -> Json.toJson(itemId)))

    (itemJson \ "itemId").asOpt[String].fold(addItemIdAndRemoveDbGarbage) (_ => rawItem)
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

  def save(itemId: String) = Action.async {
    implicit request: Request[AnyContent] =>

      logger.trace(s"[save] $itemId")
      import scalaz.Scalaz._
      import scalaz._

      def cleanIncomingXhtml(xmlString: Option[String]): Validation[String, Option[String]] = xmlString.map {
        s =>
          try {
            Success(Some(cleanXhtml(s)))
          } catch {
            case e: Throwable => {
              logger.error(s"error parsing xhtml: ${e.getMessage}")
              Failure(e.getMessage)
            }
          }
      }.getOrElse(Success(None))

      val out: Validation[String, Future[Either[StatusMessage, JsValue]]] = for {
        json <- request.body.asJson.toSuccess(Item.Errors.noJson)
        validXhtml <- cleanIncomingXhtml((json \ "xhtml").asOpt[String])
      } yield {
        logger.trace("[save] -> call hook")

        val cleanedJson = validXhtml.map {
          x =>
            logger.trace(s"clean xhtml: $x")
            json.as[JsObject] ++ Json.obj("xhtml" -> x)
        }.getOrElse(json)
        hooks.save(itemId, cleanedJson)
      }

      out match {
        case Failure(msg) => Future(BadRequest(Json.obj("error" -> msg)))
        case Success(future) => {
          future.map {
            case Left(err) => err
            case Right(json) => Ok(json)
          }
        }
      }
  }

}
