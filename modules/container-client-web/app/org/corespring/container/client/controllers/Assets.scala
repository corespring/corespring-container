package org.corespring.container.client.controllers

import play.api.mvc._
import play.api.Logger

trait Assets extends Controller {

  private val logger = Logger("container.assets")

  def loadAsset(id:String, file:String)(request : Request[AnyContent]) : Result

  def getItemId(sessionId: String): Option[String]

  def resourcePath: String = "/container-client"

  def uploadBodyParser(id:String, file:String) : BodyParser[Int]

  private def at(id: String, file: String, notFoundLocally: String => Result) = Action {
    request =>
      controllers.Assets.at(resourcePath, file)(request) match {
        case r : PlainResult if Seq(OK, NOT_MODIFIED).contains(r.header.status) => r
        case _ => notFoundLocally(id)
      }
  }

  def session(sessionId: String, file: String) = Action {
    request =>
      at(sessionId, file, (s) => {
        getItemId(s).map {
          itemId =>
            loadAsset(itemId, file)(request)
        }.getOrElse(NotFound("Can't find session or item id"))
      })(request)
  }

  def item(itemId: String, file: String) = Action {
    request =>
      at(itemId, file, (i: String) => {
        loadAsset(itemId, file)(request)
      })(request)
  }

  def upload(id:String, file: String) = Action(uploadBodyParser(id, file)){ request =>
    Ok("Done")
  }
}
