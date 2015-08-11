package org.corespring.shell.controllers.editor

import java.io.ByteArrayInputStream

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.ObjectMetadata
import org.corespring.container.client.controllers.AssetType
import org.corespring.container.client.hooks.Binary
import play.api.Logger
import play.api.mvc.SimpleResult

import scalaz.{ Failure, Success, Validation }

trait SupportingMaterialAssets[A] {
  def uploadSupportingMaterialBinary(id: A, material: String, binary: Binary): Validation[String, String]
  def deleteSupportingMaterialBinary(id: A, material: String): Validation[String, String]
  def uploadAssetToSupportingMaterial(id: A, material: String, binary: Binary): Validation[String, String]
  def deleteAssetFromSupportingMaterial(id: A, material: String, name: String): Validation[String, String]
  def getAssetFromSupportingMaterial(id: A, material: String, name: String): SimpleResult
}

trait Hm[A] extends SupportingMaterialAssets[A] {

  def s3Client: AmazonS3

  def bucket: String
  lazy val logger = Logger(classOf[Hm[A]])

  def mkKey(id: A, rest: String*): String

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

  override def deleteSupportingMaterialBinary(id: A, material: String): Validation[String, String] = {
    val key = mkKey(id, material)
    import scala.collection.JavaConversions._
    s3Client.listObjects(key).getObjectSummaries().foreach { s =>
      s3Client.deleteObject(bucket, s.getKey)
    }
    s3Client.deleteObject(bucket, key)
    Success("ok")
  }

  override def uploadAssetToSupportingMaterial(id: A, material: String, binary: Binary): Validation[String, String] = {
    val key = mkKey(id, material, binary.name)
    uploadSupportingMaterialBinaryToPath(key, binary)
  }

  override def uploadSupportingMaterialBinary(id: A, material: String, binary: Binary): Validation[String, String] = {
    val key = mkKey(id, material, binary.name)
    uploadSupportingMaterialBinaryToPath(key, binary)
  }
}

trait ItemDraftAssets {
  def copyItemToDraft(itemId: String, draftName: String)
  def copyDraftToItem(draftId: String, itemId: String)
  def deleteDraft(draftId: String)
}

trait ItemAssets {
  def deleteItem(id: String): Unit
  def uploadSupportingMaterialBinary(id: String, binary: Binary): Validation[String, String]
}
