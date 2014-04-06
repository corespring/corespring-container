package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions._
import org.corespring.container.client.controllers.helpers.XhtmlCleaner
import play.api.Logger
import play.api.libs.json.{ JsObject, JsValue, Json }
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

  import ExecutionContext.Implicits.global

  private lazy val logger = Logger("container.item")

  def hooks: ItemHooks

  def create = Action.async {
    implicit request =>
      hooks.create.map {
        either =>
          either match {
            case Left((code, msg)) => Status(code)(Json.obj("error" -> msg))
            case Right(id) => Ok(Json.obj("itemId" -> id))
          }
      }
  }

  def load(itemId: String) = Action.async {
    implicit request =>
      hooks.load(itemId).map {
        either =>
          either match {
            case Left(err) => err
            case Right(json) => Ok(json)
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

      val out: Validation[String, Future[Either[SimpleResult, JsValue]]] = for {
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
