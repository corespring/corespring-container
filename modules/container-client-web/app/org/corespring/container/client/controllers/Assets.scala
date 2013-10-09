package org.corespring.container.client.controllers

import play.api.mvc._
import play.api.Logger

trait Assets extends Controller {

  def loadAsset(id:String, file:String)(request : Request[AnyContent]) : Result

  def uploadBodyParser(id:String, file:String) : BodyParser[Int]

  private val logger = Logger("container.assets")
  def at(id:String, path: String, file: String) = Action{ request =>
    controllers.Assets.at(path, file)(request) match {
      case r : PlainResult if Seq(OK, NOT_MODIFIED).contains(r.header.status) => r
      case _ =>  {
        logger.debug(s"file: $file")
        logger.debug(s"id: $id")
        loadAsset(id, file)(request)
      }
    }
  }

  def upload(id:String, file: String) = Action(uploadBodyParser(id, file)){ request =>
    Ok("Done")
  }
}
