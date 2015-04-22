package org.corespring.container.client

import java.util.{List,ArrayList}

import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.model.{ObjectListing, S3ObjectSummary}
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope

class AssetUtilsTest extends Specification with Mockito{

  class __(fromKeys: Seq[String]) extends Scope{

    private def summary(key:String) = {
      val m = mock[S3ObjectSummary]
      m.getKey returns key
      m
    }

    lazy val s3 = {
      val m = mock[AmazonS3Client]
      m.listObjects(any[String], any[String]) returns {
        val out = {
          val m = mock[ObjectListing]
          m.getObjectSummaries returns {
            val l = new ArrayList[S3ObjectSummary]()
            fromKeys.foreach{ k =>
              l.add(summary(k))
            }
            l
          }
          m
        }
        out
      }
      m
    }
    lazy val bucket = "bucket"
    lazy val assetUtils = new AssetUtils(s3, bucket)
  }

  "AssetUtils" should {
    "copyDir" should {

      "call copyObject for each key" in new __(Seq("from/apple.jpg")) {
        assetUtils.copyDir("from", "to")
        there was one (s3).listObjects(bucket, "from")
        there was one (s3).copyObject(bucket, "from/apple.jpg", bucket, "to/apple.jpg")
      }
    }

    "deleteDir" should {
      "call deleteObject for each key" in new __(Seq("from/apple.jpg")){
        assetUtils.deleteDir("from")
        there was one (s3).deleteObject(bucket, "from/apple.jpg")
      }
    }
  }
}
