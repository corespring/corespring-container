package org.corespring.container.client

import com.amazonaws.auth.AWSCredentials
import com.amazonaws.services.s3.AmazonS3Client
import grizzled.slf4j.Logger
import org.corespring.container.logging.ContainerLogger

import scala.collection.JavaConversions._
import scala.util.{ Failure, Success, Try }


object AssetUtils{
  def apply(key:String, secret:String, bucket:String) = {
    val s3: AmazonS3Client = {
      new AmazonS3Client(new AWSCredentials {
        override def getAWSAccessKeyId: String = key

        override def getAWSSecretKey: String = secret
      })
    }

    new AssetUtils(s3, bucket)
  }
}

class AssetUtils(s3:AmazonS3Client, bucket:String) {

  private val logger: Logger = ContainerLogger.getLogger("AssetUtils")

  def run(fn: => Boolean): Boolean = {
    val out = Try(fn)
    out match {
      case Success(b) => b
      case Failure(e) => {
        e.printStackTrace
        false
      }
    }
  }

  def copyDir(from: String, to: String): Boolean = run {
    logger.debug(s"function=copyDir from=$from to=$to")

    val listing = s3.listObjects(bucket, from)
    listing.getObjectSummaries.foreach { s =>
      val destination = s.getKey.replace(from, to)
      logger.trace(s"function=copyDir, copyObject, from=${s.getKey} to=$destination")
      s3.copyObject(bucket, s.getKey, bucket, destination)
    }
    true
  }

  def deleteDir(path: String): Boolean = run {
    logger.debug(s"function=deleteDir from=$path")
    val listing = s3.listObjects(bucket, path)
    val keys = listing.getObjectSummaries.map { s =>
      s.getKey
    }

    keys.foreach { k =>
      logger.trace(s"function=deleteDir, delete=$k")
      s3.deleteObject(bucket, k)
    }
    true
  }
}
