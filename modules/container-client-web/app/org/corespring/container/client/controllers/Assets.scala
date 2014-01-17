package org.corespring.container.client.controllers

import play.api.mvc._
import scala.concurrent.{ExecutionContext, Future}

trait Assets extends Controller {

  import ExecutionContext.Implicits.global

  def loadAsset(id:String, file:String)(request : Request[AnyContent]) : SimpleResult

  def getItemId(sessionId: String): Option[String]

  def resourcePath: String = "/container-client"

  def uploadBodyParser(id:String, file:String) : BodyParser[Int]

  private def at(id: String, file: String, notFoundLocally: String => SimpleResult) = Action.async {
    request =>
      val result : Future[SimpleResult] = controllers.Assets.at(resourcePath, file)(request)

      result.map{ r => r match {
        case s : SimpleResult if Seq(OK,NOT_MODIFIED).contains(s.header.status) => s
        case _ => notFoundLocally(id)
      }}
  }

  def session(sessionId: String, file: String) = Action.async {
    request =>
      at(sessionId, file, (s) => {
        getItemId(s).map {
          itemId =>
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

  def upload(id:String, file: String) = Action(uploadBodyParser(id, file)){ request =>
    Ok("Done")
  }
}
