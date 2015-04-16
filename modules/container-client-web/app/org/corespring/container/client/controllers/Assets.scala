package org.corespring.container.client.controllers

import org.corespring.container.client.HasContext
import org.corespring.container.client.hooks.AssetHooks
import org.corespring.container.logging.ContainerLogger
import play.api.mvc._
import play.utils.UriEncoding

import scala.concurrent.Future

trait Assets extends Controller with HasContext {

  lazy val logger = ContainerLogger.getLogger("Assets")

  def loadAsset(id: String, name: String, file: String)(request: Request[AnyContent]): SimpleResult

  def getItemId(sessionId: String): Option[String]

  def resourcePath: String = "/container-client"

  def hooks: AssetHooks

  private def at(id: String, file: String, notFoundLocally: String => SimpleResult) = Action.async {
    request =>
      val result: Future[SimpleResult] = controllers.Assets.at(resourcePath, file)(request)
      result.map { r =>
        r match {
          case s: SimpleResult if Seq(OK, NOT_MODIFIED).contains(s.header.status) => s
          case _ => {
            logger.trace(s"[at] itemId: $id - Can't find file locally")
            notFoundLocally(id)
          }
        }
      }
  }

  private def encode(s:String) = {
    UriEncoding.encodePathSegment(s, "utf-8")
  }

  def session(sessionId: String, file: String) = Action.async {
    request =>
      val encodedFile = encode(file)
      at(sessionId, encodedFile, (s) => {
        logger.trace(s"[session] sessionId: $sessionId -> $encodedFile")
        getItemId(s).map {
          itemId =>
            logger.trace(s"[session] sessionId: $sessionId, itemId: $itemId -> $encodedFile")
            loadAsset(itemId, "data", encodedFile)(request)
        }.getOrElse(NotFound(s"Can't find session id: $sessionId, path: ${request.path}"))
      })(request)
  }

  def item(itemId: String, file: String) = Action.async {
    request =>
      val encodedFile = encode(file)
      at(itemId, encodedFile, (i: String) => {
        loadAsset(itemId, "data", encodedFile)(request)
      })(request)
  }

  def supportingMaterial(itemId: String, name: String, file: String) = Action.async {
    request =>
      val encodedFile = encode(file)
      at(itemId, s"$name/$encodedFile", (i: String) => {
        loadAsset(itemId, name, encodedFile)(request)
      })(request)
  }

  def upload(id: String, file: String) = hooks.uploadAction(id, encode(file)) {
    r => Ok("")
  }

  def delete(itemId: String, file: String) = Action.async {
    implicit request =>
      hooks.delete(itemId, encode(file)).map { err =>
        err match {
          case None => Ok
          case Some((code, msg)) => Status(code)(msg)
        }
      }
  }

}
