package org.corespring.container.client.controllers

import org.corespring.container.client.cache.{PreCache, ContainerCache}
import play.api.Logger
import play.api.mvc.{SimpleResult, Action, Controller}

trait ComponentSets extends Controller {

  lazy val logger = Logger("container.component.sets")

  implicit def cache: ContainerCache

  def resource(hash: String, suffix: String) = {
    Action {
      request =>
        val notModified = for {
          requestEtag <- request.headers.get(IF_NONE_MATCH)
          etag <- cache.getAs[String](PreCache.etagKey(hash))
          if requestEtag == "*" || etag == requestEtag
        } yield {
          logger.trace(s"[resource] $hash - not modified")
          NotModified
        }

        notModified.getOrElse {
          val result = cache.getAs[SimpleResult](hash).getOrElse(NotFound(""))
          result
        }
    }
  }

}
