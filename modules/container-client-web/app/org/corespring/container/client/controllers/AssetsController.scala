package org.corespring.container.client.controllers

import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.hooks.{ AssetHooks, GetAssetHook }
import play.api.mvc.{ RequestHeader, SimpleResult, Action, Controller }

import scala.concurrent.{ Future }

trait GetAsset[H <: GetAssetHook] extends Controller with HasContainerContext {

  def hooks: H

  def getFile(id: String, path: String) = Action.async { request =>
    Future { hooks.loadFile(id, path)(request) }
  }
}

trait AssetsController[H <: AssetHooks] extends GetAsset[H] {

  override def hooks: H

  def acceptableSuffixes: Seq[String] = Seq("png", "gif", "jpeg", "jpg")

  def acceptableType(rh: RequestHeader): Option[SimpleResult] = {
    if (acceptableSuffixes.isEmpty) {
      None
    } else {
      val suffix = if (rh.path.contains(".")) rh.path.split("\\.").lastOption else None

      suffix match {
        case None => Some(BadRequest(s"Unknown file suffix for path: ${rh.path}"))
        case Some(s) => if (acceptableSuffixes.contains(s)) {
          None
        } else {
          Some(BadRequest(s"Unsupported suffix: $s"))
        }
      }
    }
  }

  def uploadFile(id: String, path: String) = Action.async(hooks.upload(id, path)(acceptableType)) { request =>
    request.body.map { r =>
      Ok(r.path)
    }
  }

  def deleteFile(id: String, path: String) = Action.async {
    implicit request =>
      hooks.deleteFile(id, path).map { err =>
        err match {
          case None => Ok
          case Some((code, msg)) => Status(code)(msg)
        }
      }
  }
}
