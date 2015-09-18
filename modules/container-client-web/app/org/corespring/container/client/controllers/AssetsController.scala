package org.corespring.container.client.controllers

import org.corespring.container.client.hooks.{ AssetHooks, GetAssetHook }
import play.api.mvc.{ Action, Controller }

import scala.concurrent.{ ExecutionContext, Future }

trait GetAsset[H <: GetAssetHook] extends Controller {

  implicit def ec: ExecutionContext

  def hooks: H

  def getFile(id: String, path: String) = Action.async { request =>
    hooks.loadFile(id, path)(request)
  }
}

trait AssetsController[H <: AssetHooks] extends GetAsset[H] {

  override def hooks: H

  def uploadFile(id: String, path: String) = Action.async(hooks.upload(id, path)(rh => None)) { request =>
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
