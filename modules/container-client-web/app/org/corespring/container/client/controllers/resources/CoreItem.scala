package org.corespring.container.client.controllers.resources

import java.io.{ByteArrayInputStream, IOException}
import java.net.URLConnection

import org.corespring.container.client.controllers.helpers.{ PlayerXhtml, XhtmlProcessor }
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import play.api.Logger
import play.api.libs.json.{ JsString, JsObject, JsValue, Json }
import play.api.mvc._

import scala.concurrent.{ ExecutionContext, Future }
import scalaz.{ Failure, Success, Validation }
import scalaz.Scalaz._

object ItemJson {

  def apply(components: Seq[String], rawJson: JsValue): JsObject = {

    val processedXhtml = (rawJson \ "xhtml").asOpt[String].map(s => PlayerXhtml.mkXhtml(components, s)).getOrElse {
      throw new IllegalArgumentException(s"the Item json must contain 'xhtml'\n ${Json.stringify(rawJson)}")
    }

    val itemId = (rawJson \ "_id" \ "$oid").asOpt[JsString].map(id => Json.obj("itemId" -> id)).getOrElse(Json.obj())
    rawJson.as[JsObject] + ("xhtml" -> JsString(processedXhtml)) ++ itemId
  }
}

trait CoreItem extends Controller {

  lazy val logger = Logger(classOf[CoreItem])

  implicit def toResult(m: StatusMessage): SimpleResult = play.api.mvc.Results.Status(m._1)(Json.obj("error" -> m._2))

  implicit def ec: ExecutionContext

  /**
   * A list of all the component types in the container
   * @return
   */
  protected def componentTypes: Seq[String]

  def hooks: CoreItemHooks

  type SaveSig = String => Future[Either[(Int, String), JsValue]]

  val noCacheHeader = "no-cache, no-store, must-revalidate"

  def getContentType(bytes:Array[Byte]) : Option[String] = try {
      val ba = new ByteArrayInputStream(bytes)
      val out = URLConnection.guessContentTypeFromStream(ba)
      ba.close()
      Some(out)
    } catch {
      case t : Throwable => None
    }

  def createSupportingMaterial(id:String) = Action.async{ request =>

    def createFromJson(json:JsValue) : Validation[String,HtmlSupportingMaterial] = {
      for{
        title <- (json \ "title").asOpt[String].toSuccess("no title")
        materialType <- (json \ "materialType").asOpt[String].toSuccess("no material type")
        html <- (json \ "html").asOpt[String].toSuccess("no html")
      } yield {
        HtmlSupportingMaterial(
          title,
          materialType,
          Html("index.html", html),
          Seq.empty)
      }
    }

    def createFromRaw(raw:RawBuffer) : Validation[String,SupportingMaterial[File]] = {
      for{
        title <- request.getQueryString("title").toSuccess("no title")
        materialType <- request.getQueryString("materialType").toSuccess("no material type")
        bytes <- raw.asBytes(raw.size.toInt)
        contentType <- getContentType(bytes).toSuccess("can't guess contentType")
    } yield {
       BinarySupportingMaterial(
         title,
         materialType,
         Binary(s"main.$contentType",
           contentType,
           bytes)
       )
      }
    }

    val maybeMaterial = request.body.asJson.map(createFromJson).orElse(request.body.asRaw.map(createFromRaw))

    maybeMaterial.map{ v =>
      v match {
        case Failure(err) => Future(BadRequest(err))
        case Success(sm) => {
          hooks.createSupportingMaterial(sm).map { e => e match {
            case ((err, msg)) => Status(err)(msg)
            case head :: xs => Status(CREATED)(Json.obj("ok"))
          }
          }
        }
      }
    }.getOrElse{
      Future(BadRequest("neither bytes nor json sent"))
    }
  }

def load(itemId: String) = Action.async { implicit request =>
hooks.load(itemId).map {
  either =>
    either match {
      case Left(sm) => sm
      case Right(rawItem) => {
        Ok(ItemJson(componentTypes, rawItem))
          .withHeaders(
            "Cache-Control" -> noCacheHeader,
            "Expires" -> "0")
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
