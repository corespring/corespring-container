package org.corespring.container.client.controllers

import play.api.mvc._
import scala.concurrent.{ ExecutionContext, Future }
import play.api.Logger
import play.api.libs.json.{ JsString, Json }
import org.corespring.container.client.actions.AssetActions

trait Assets extends Controller {

  lazy val logger = Logger("v2player.assets")

  import ExecutionContext.Implicits.global

  def loadAsset(id: String, file: String)(request: Request[AnyContent]): SimpleResult

  def getItemId(sessionId: String): Option[String]

  def resourcePath: String = "/container-client"

  def actions: AssetActions[AnyContent]

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

  def session(sessionId: String, file: String) = Action.async {
    request =>
      at(sessionId, file, (s) => {
        logger.trace(s"[session] sessionId: $sessionId -> $file")
        getItemId(s).map {
          itemId =>
            logger.trace(s"[session] sessionId: $sessionId, itemId: $itemId -> $file")
            loadAsset(itemId, file)(request)
        }.getOrElse(NotFound(s"Can't find session id: $sessionId, path: ${request.path}"))
      })(request)
  }

  def item(itemId: String, file: String) = Action.async {
    request =>
      at(itemId, file, (i: String) => {
        loadAsset(itemId, file)(request)
      })(request)
  }

  def upload(id: String, file: String) = actions.upload(id, file) {
    request => Ok
  }

  def delete(itemId: String, file: String) = actions.delete(itemId, file) {
    request =>
      request.error.map { e =>
        Ok(Json.obj("error" -> JsString(e)))
      }.getOrElse(Ok)
  }
}
