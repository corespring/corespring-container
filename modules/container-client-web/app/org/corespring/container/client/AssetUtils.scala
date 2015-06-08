package org.corespring.container.client

import com.amazonaws.services.s3.model.{ ObjectListing, AmazonS3Exception }
import com.amazonaws.services.s3.{ AmazonS3 }
import grizzled.slf4j.Logger
import org.corespring.container.logging.ContainerLogger

import scala.collection.JavaConversions._
import scala.util.{ Failure, Success, Try }

class AssetUtils(s3: AmazonS3, bucket: String) {

  private def listObjects(bucket: String, key: String): Either[Throwable, ObjectListing] = {
    Try(s3.listObjects(bucket, key)) match {
      case Success(ol) => Right(ol)
      case Failure(e) => Left(e)
    }
  }

  private val logger: Logger = ContainerLogger.getLogger("AssetUtils")

  def withListing(bucket: String, key: String, fn: ObjectListing => Boolean): Boolean = {
    listObjects(bucket, key) match {
      case Left(e) => e match {
        case s3: AmazonS3Exception => s3.getStatusCode == 404
        case t: Throwable => {
          t.printStackTrace
          false
        }
      }
      case Right(listing) => fn(listing)
    }
  }

  def copyDir(from: String, to: String): Boolean = {
    logger.debug(s"function=copyDir from=$from to=$to")

    withListing(bucket, from, (listing) => {
      listing.getObjectSummaries.foreach { s =>
        val destination = s.getKey.replace(from, to)
        logger.trace(s"function=copyDir, copyObject, from=${s.getKey} to=$destination")
        s3.copyObject(bucket, s.getKey, bucket, destination)
      }
      true
    })
  }

  def deleteDir(path: String): Boolean = {
    logger.debug(s"function=deleteDir from=$path")
    withListing(bucket, path, (listing) => {
      val keys = listing.getObjectSummaries.map(_.getKey)
      keys.foreach { k =>
        logger.trace(s"function=deleteDir, delete=$k")
        s3.deleteObject(bucket, k)
      }
      true
    })
  }

}
