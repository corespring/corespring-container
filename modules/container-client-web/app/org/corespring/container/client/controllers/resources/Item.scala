package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions._
import play.api.Logger
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._

object Item {

  object Errors {
    val noJson = "No json in request body"
    val errorSaving = "Error Saving"
    val invalidXhtml = "Invalid xhtml"
  }

}

trait Item extends Controller {

  private lazy val logger = Logger("container.item")

  def actions: ItemActions[AnyContent]

  def hooks: ItemHooks[AnyContent]

  def create = actions.create {
    (code, msg) =>
      Status(code)(Json.obj("error" -> msg))
  } {
    request => Ok(Json.obj("itemId" -> request.itemId))
  }

  def load(itemId: String) = actions.load(itemId) {
    request: ItemRequest[AnyContent] =>
      Ok(Json.obj("item" -> request.item))
  }

  def save(itemId: String, property: Option[String] = None) = Action {
    implicit request: Request[AnyContent] =>

      def validXhtml(s: String) = try {
        scala.xml.XML.loadString(s)
        true
      } catch {
        case e: Throwable => {
          logger.error(s"error parsing xhtml: ${e.getMessage}")
          false
        }
      }

      import scalaz.Scalaz._
      import scalaz._

      val out: Validation[Result, JsValue] = for {
        json <- request.body.asJson.toSuccess("No json in body")
        xhtml <- (json \ "xhtml").asOpt[String].toSuccess("No xhtml in json body")
        //if(validXhtml(xhtml)) Success(json) else Failure("Invalid xhtml")
        result <- hooks.save(itemId, xhtml, json \ "components")
      } yield {
        hooks.save(itemId, xhtml, json \ "components") match {
          case Left(err) => Failure(err)
          case Right(json) => Success(Ok(json))
        }
      }

      //out.getOrElse(BadRequest)

      Ok
  }

}
