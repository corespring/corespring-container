package org.corespring.container.client.controllers.resources

import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.controllers.helpers.{ PlayerXhtml, XhtmlProcessor }
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import play.api.Logger
import play.api.libs.json.{ JsString, JsObject, JsValue, Json }
import play.api.mvc._

import scala.concurrent.{ Future }
import scalaz.{ Failure, Success, Validation }
import scalaz.Scalaz._

object ItemJson {

  def apply(playerXhtml: PlayerXhtml, rawJson: JsValue): JsObject = {

    val processedXhtml = (rawJson \ "xhtml").asOpt[String].map(s => playerXhtml.processXhtml(s)).getOrElse {
      throw new IllegalArgumentException(s"the Item json must contain 'xhtml'\n ${Json.stringify(rawJson)}")
    }

    val itemId = (rawJson \ "_id" \ "$oid").asOpt[JsString].map(id => Json.obj("itemId" -> id)).getOrElse(Json.obj())
    rawJson.as[JsObject] + ("xhtml" -> JsString(processedXhtml)) ++ itemId
  }
}

trait CoreItem extends CoreSupportingMaterials with Controller with HasContainerContext {

  lazy val logger = Logger(classOf[CoreItem])

  def playerXhtml: PlayerXhtml

  implicit def toResult(m: StatusMessage): SimpleResult = play.api.mvc.Results.Status(m._1)(Json.obj("error" -> m._2))

  /**
   * A list of all the component types in the container
   * @return
   */
  protected def componentTypes: Seq[String]

  def hooks: CoreItemHooks

  type SaveSig = String => Future[Either[(Int, String), JsValue]]

  val noCacheHeader = "no-cache, no-store, must-revalidate"

  def load(itemId: String) = Action.async { implicit request =>
    hooks.load(itemId).map {
      either =>
        either match {
          case Left(sm) => sm
          case Right((rawItem,defaults)) => {
            Ok(ItemJson(playerXhtml, rawItem))
              .withHeaders(
                "Cache-Control" -> noCacheHeader,
                "Expires" -> "0")
          }
        }
    }
  }

  private def errorResult(err: String, status: Int = BAD_REQUEST) = Future.successful(Status(status)(Json.obj("error" -> err)))

  def saveXhtmlAndComponents(id: String) = Action.async { implicit request: Request[AnyContent] =>

    val validation = for {
      json <- request.body.asJson.toSuccess(ItemDraft.Errors.noJson)
      markup <- (json \ "xhtml").asOpt[String].toSuccess("Missing required field 'xhtml' of type 'string'.")
      components <- (json \ "components").asOpt[JsObject].toSuccess("Missing required field 'components' of type 'object'")
    } yield (markup -> components)

    validation match {
      case Failure(s) => errorResult(s)
      case Success((markup, components)) => {
        hooks.saveXhtmlAndComponents(id, markup, components).flatMap {
          case Left((code, msg)) => errorResult(msg, code)
          case Right(json) => Future.successful(Ok(json))
        }
      }
    }
  }

  def saveSubset(id: String, subset: String) = Action.async { implicit request: Request[AnyContent] =>

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
      result <- Success(fn(id))
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
