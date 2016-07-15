package org.corespring.shell.controllers

import java.io.ByteArrayInputStream
import java.net.URLDecoder

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.ObjectMetadata
import org.corespring.amazon.s3.S3Service
import org.corespring.container.client.AssetUtils
import org.corespring.container.client.controllers.AssetType.AssetType
import org.corespring.container.client.controllers.{ AssetType, Assets }
import org.corespring.container.client.hooks.{ Binary, UploadResult }
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.shell.controllers.editor.{ ItemAssets, ItemDraftAssets }
import org.corespring.shell.services.ItemService
import play.api.Logger
import play.api.libs.MimeTypes
import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.mvc.{ BodyParser, SimpleResult, RequestHeader }

import scala.concurrent.Future
import scalaz.{ Failure, Success, Validation }

case class S3Config(bucket: String, key: String, secret: String)

trait ShellAssetsUtils {
  def contentType(s: String) = {
    val regexp = """\.(\w+?)$""".r
    regexp.findFirstMatchIn(s.toLowerCase) match {
      case Some(res) => MimeTypes.forExtension(res.group(1)).getOrElse("image/png")
      case _ => "image/png"
    }
  }
}

class ShellAssets(
  s3: S3Config,
  val containerContext: ContainerExecutionContext,
  playS3: S3Service,
  s3Client: AmazonS3,
  assetUtils: AssetUtils,
  itemService: ItemService) extends Assets with ShellAssetsUtils with ItemDraftAssets with ItemAssets {

  private lazy val logger = Logger(this.getClass)

  private def mkPath(t: AssetType, id: String, rest: String*) = {
    (t.folderName +: id +: rest).mkString("/").replace("~", "/")
  }

  private def mkSupportingMaterialPath(t: AssetType, id: String, rest: String*) = {
    mkPath(t, id, ("materials" +: rest): _*)
  }

  override def load(t: AssetType, id: String, path: String)(implicit h: RequestHeader): SimpleResult = {
    val result = playS3.download(s3.bucket, URLDecoder.decode(mkPath(t, id, path), "utf-8"), Some(h.headers))

    if (result.header.status == OK || result.header.status == NOT_MODIFIED) {
      result
    } else {
      playS3.download(s3.bucket, mkPath(t, id, path), Some(h.headers))
    }
  }

  override def delete(t: AssetType, id: String, path: String)(implicit h: RequestHeader): Future[Option[(Int, String)]] = Future {
    val response = playS3.delete(s3.bucket, mkPath(t, id, path))
    if (response.success) {
      val fileName = path.substring(path.lastIndexOf('/') + 1)
      itemService.load(id) match {
        case Some(item) =>
          val transformer = (__ \ "files").json.update(
            of[JsArray].map { case JsArray(arr) => JsArray(arr.filterNot(_ \ "name" == JsString(fileName))) })
          val fallback = __.json.update((__ \ "files").json.put(JsArray(Seq())))
          item.transform(transformer).orElse(item.transform(fallback)) match {
            case succ: JsSuccess[JsObject] =>
              itemService.save(id, succ.get)
            case _ =>
          }
        case _ =>
      }
      None
    } else {
      Some(BAD_REQUEST -> s"${response.key}: ${response.msg}")
    }
  }

  override def upload(t: AssetType, id: String, path: String)(predicate: (RequestHeader) => Option[SimpleResult]): BodyParser[Future[UploadResult]] = {
    playS3.s3ObjectAndData[Unit](s3.bucket, _ => mkPath(t, id, path))((rh) => {
      predicate(rh).map { err =>
        Left(err)
      }.getOrElse(Right(Unit))
    }).map { f =>
      f.map { tuple =>
        itemService.load(id) match {
          case Some(item) =>
            val fileObj = Json.obj(
              "name" -> tuple._1.getKey.substring(tuple._1.getKey.lastIndexOf('/') + 1),
              "contentType" -> contentType(tuple._1.getKey))
            val transformer = (__ \ "files").json.update(
              of[JsArray].map { case JsArray(arr) => JsArray(arr :+ fileObj) })
            val fallback = __.json.update((__ \ "files").json.put(JsArray(Seq(fileObj))))
            item.transform(transformer).orElse(item.transform(fallback)) match {
              case succ: JsSuccess[JsObject] =>
                itemService.save(id, succ.get)
              case _ =>
            }
          case _ =>
        }
        UploadResult(path)
      }
    }
  }
  override def copyItemToDraft(itemId: String, draftName: String): Unit = {
    assetUtils.copyDir(mkPath(AssetType.Item, itemId), mkPath(AssetType.Draft, itemId, draftName))
  }

  override def deleteDraft(draftId: String): Unit = {
    assetUtils.deleteDir(mkPath(AssetType.Draft, draftId))
  }

  override def copyDraftToItem(draftName: String, itemId: String): Unit = {
    assetUtils.copyDir(mkPath(AssetType.Draft, itemId, draftName), mkPath(AssetType.Item, itemId))
  }

  override def deleteItem(id: String): Unit = assetUtils.deleteDir(mkPath(AssetType.Item, id))

  private def uploadSupportingMaterialBinaryToPath(key: String, binary: Binary): Validation[String, String] = {
    val is = new ByteArrayInputStream(binary.data)
    val metadata = new ObjectMetadata()
    metadata.setContentType(binary.mimeType)
    metadata.setContentLength(binary.data.length)

    logger.trace(s"[upload material] key: $key")
    try {
      s3Client.putObject(s3.bucket, key, is, metadata)
      Success(key)
    } catch {
      case t: Throwable => {
        if (logger.isDebugEnabled) {
          t.printStackTrace()
        }
        Failure(t.getMessage)
      }
    }
  }

  override def uploadSupportingMaterialBinary(id: String, binary: Binary): Validation[String, String] = {
    val key = mkSupportingMaterialPath(AssetType.Item, id, binary.name)
    logger.trace(s"[upload material] key: $key")
    uploadSupportingMaterialBinaryToPath(key, binary)
  }

}
