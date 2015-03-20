package org.corespring.container.client

import com.amazonaws.{ AmazonServiceException, AmazonClientException }
import com.amazonaws.auth.AWSCredentials
import com.amazonaws.services.s3.transfer.TransferManager

class AssetUtils(key: String, secret: String, bucket: String) {
  private lazy val transferManager: TransferManager = {
    new TransferManager(new AWSCredentials {
      override def getAWSAccessKeyId: String = key

      override def getAWSSecretKey: String = secret
    })
  }

  def copy(from: String, to: String): Boolean = {
    try {
      val copy = transferManager.copy(bucket, from, bucket, to)
      copy.waitForCopyResult()
      true
    } catch {
      case a: AmazonClientException => false
      case e: AmazonServiceException => false
      case i: InterruptedException => false
    }
  }
}
