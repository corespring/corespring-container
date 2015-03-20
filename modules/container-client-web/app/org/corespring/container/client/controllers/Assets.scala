package org.corespring.container.client.controllers

import com.amazonaws.{ AmazonServiceException, AmazonClientException }
import com.amazonaws.auth.AWSCredentials
import com.amazonaws.services.s3.transfer.TransferManager
import org.corespring.container.client.HasContext
import play.api.mvc._

import scala.concurrent.Future

object AssetType extends Enumeration {
  type AssetType = Value
  val Draft, Item, Player = Value
}

trait Assets extends Controller with HasContext {
  import AssetType._
  def load(t: AssetType, id: String, path: String)(implicit h: RequestHeader): SimpleResult
  def delete(t: AssetType, id: String, path: String)(implicit h: RequestHeader): Future[Option[(Int, String)]]
  def upload(t: AssetType, id: String, path: String)(block: Request[Int] => SimpleResult): Action[Int]
}

