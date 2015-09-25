package org.corespring.shell.controllers.editor

import java.io.ByteArrayInputStream

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.ObjectMetadata
import org.corespring.amazon.s3.S3Service
import org.corespring.container.client.hooks.{ FileDataStream, Binary }
import play.api.Logger
import play.api.http.HeaderNames
import play.api.mvc.SimpleResult

import scalaz.{ Failure, Success, Validation }

trait SupportingMaterialAssets[A] {
  def uploadSupportingMaterialBinary(id: A, material: String, binary: Binary): Validation[String, String]
  def deleteSupportingMaterialBinary(id: A, material: String): Validation[String, String]
  def uploadAssetToSupportingMaterial(id: A, material: String, binary: Binary): Validation[String, String]
  def deleteAssetFromSupportingMaterial(id: A, material: String, name: String): Validation[String, String]
  def getAsset(id: A, material: String, name: String): Validation[String, FileDataStream]
}

class ContainerSupportingMaterialAssets[A](
  bucket: String,
  s3Client: AmazonS3,
  s3Service: S3Service,
  mkKey: (A, Seq[String]) => String) extends SupportingMaterialAssets[A] {

  lazy val logger = Logger(classOf[ContainerSupportingMaterialAssets[A]])

  private def uploadSupportingMaterialBinaryToPath(key: String, binary: Binary): Validation[String, String] = {
    val is = new ByteArrayInputStream(binary.data)
    val metadata = new ObjectMetadata()
    metadata.setContentType(binary.mimeType)
    metadata.setContentLength(binary.data.length)

    logger.trace(s"[upload material] key: $key")
    try {
      s3Client.putObject(bucket, key, is, metadata)
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

  override def getAsset(id: A, material: String, name: String): Validation[String, FileDataStream] = {
    val key = mkKey(id, Seq(material, name))
    try {
      val s3Object = s3Client.getObject(bucket, key)

      Success(
        FileDataStream(s3Object.getObjectContent,
          s3Object.getObjectMetadata.getContentLength,
          s3Object.getObjectMetadata.getContentType,
          Map(HeaderNames.ETAG -> s3Object.getObjectMetadata.getETag)))
    } catch {
      case t: Throwable => Failure(s"Error thrown: ${t.getMessage}")
    }

  }

  override def deleteAssetFromSupportingMaterial(id: A, material: String, name: String): Validation[String, String] = {
    val key = mkKey(id, Seq(material, name))
    s3Client.deleteObject(bucket, key)
    Success("ok")
  }

  override def deleteSupportingMaterialBinary(id: A, material: String): Validation[String, String] = {
    val key = mkKey(id, Seq(material))
    import scala.collection.JavaConversions._
    val listResult = s3Client.listObjects(bucket, key)
    listResult.getObjectSummaries().foreach { s =>
      s3Client.deleteObject(bucket, s.getKey)
    }
    s3Client.deleteObject(bucket, key)
    Success("ok")
  }

  override def uploadAssetToSupportingMaterial(id: A, material: String, binary: Binary): Validation[String, String] = {
    val key = mkKey(id, Seq(material, binary.name))
    uploadSupportingMaterialBinaryToPath(key, binary)
  }

  override def uploadSupportingMaterialBinary(id: A, material: String, binary: Binary): Validation[String, String] = {
    val key = mkKey(id, Seq(material, binary.name))
    uploadSupportingMaterialBinaryToPath(key, binary)
  }
}

trait ItemDraftAssets {
  def copyItemToDraft(itemId: String, draftName: String)
  def copyDraftToItem(draftName: String, itemId: String)
  def deleteDraft(draftId: String)
}

trait ItemAssets {
  def deleteItem(id: String): Unit
  def uploadSupportingMaterialBinary(id: String, binary: Binary): Validation[String, String]
}
