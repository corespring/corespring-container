package org.corespring.container.client.controllers.resources

import java.io.{ ByteArrayInputStream }
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

  val acceptableTypes = Seq(
    "application/pdf",
    "image/png",
    "image/gif",
    "image/jpeg")

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

  def getContentType(bytes: Array[Byte]): Option[String] = try {
    val ba = new ByteArrayInputStream(bytes)
    val out = URLConnection.guessContentTypeFromStream(ba)
    ba.close()
    Some(out)
  } catch {
    case t: Throwable => None
  }

  def createSupportingMaterialFromFile(id: String, materialType: String, filename: String) = Action.async { request =>

    lazy val extension: Option[String] = if (filename.contains("."))
      Some(filename.split("\\.").last)
    else None

    lazy val basename: String = if (filename.contains("."))
      filename.split("\\.").init.mkString(".")
    else
      filename

    def accept(mimeType: String) = {
      if (acceptableTypes.contains(mimeType)) {
        Success(true)
      } else {
        Failure(s"not acceptable only types supported: ${acceptableTypes.mkString(",")}")
      }
    }

    def createFromRaw(raw: RawBuffer): Validation[String, CreateBinaryMaterial] = {
      for {
        extension <- extension.toSuccess("can't read extension")
        mimeType <- play.api.libs.MimeTypes.forFileName(filename).toSuccess("can't guess mimeType")
        acceptable <- accept(mimeType)
        bytes <- raw.asBytes(raw.size.toInt).toSuccess("can't load bytes")
      } yield {

        val name = request.getQueryString("name").getOrElse(basename)

        CreateBinaryMaterial(
          name,
          materialType,
          Binary(s"main.$extension",
            mimeType,
            bytes))
      }
    }

    create((body) => for {
      raw <- request.body.asRaw.toSuccess("no bytes in request body")
      sm <- createFromRaw(raw)
    } yield sm)(id, request)
  }

  private def create[F <: File](mk: AnyContent => Validation[String, CreateNewMaterialRequest[F]])(id: String, r: Request[AnyContent]): Future[SimpleResult] = {
    mk(r.body) match {
      case Success(sm) => {
        val f: Future[Either[(Int, String), JsValue]] = hooks.createSupportingMaterial(id, sm)(r)
        f.map { e =>
          e match {
            case Left((err, msg)) => Status(err)(msg)
            case Right(json) => Status(CREATED)(json)
          }
        }
      }
      case Failure(e) => Future(BadRequest(Json.obj("error" -> e)))
    }
  }

  def createSupportingMaterial(id: String) = Action.async { request =>

    def createFromJson(json: JsValue): Validation[String, CreateHtmlMaterial] = {
      for {
        name <- (json \ "name").asOpt[String].toSuccess("no name")
        materialType <- (json \ "materialType").asOpt[String].toSuccess("no material type")
        html <- (json \ "html").asOpt[String].toSuccess("no html")
      } yield {
        CreateHtmlMaterial(
          name,
          materialType,
          Html("index.html", html),
          Seq.empty)
      }
    }

    create((body) => for {
      json <- body.asJson.toSuccess("no json in request body")
      sm <- createFromJson(json)
    } yield sm)(id, request)

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
