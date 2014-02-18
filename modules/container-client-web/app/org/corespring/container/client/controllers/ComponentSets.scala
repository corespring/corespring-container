package org.corespring.container.client.controllers

import play.api.http.ContentTypes
import play.api.mvc.{Action, Controller}
import org.corespring.container.client.cache.ContainerCache

trait ComponentSets extends Controller {


  def cache: ContainerCache

  def resource(hash: String, suffix: String) = Action {
    request =>
      val contentType = suffix match {
        case "js" => ContentTypes.JAVASCRIPT
        case "css" => ContentTypes.CSS
        case _ => throw new RuntimeException(s"unsupported content type: $suffix")
      }
      cache.get(hash).map(Ok(_).as(contentType)).getOrElse(NotFound(""))
  }

}
