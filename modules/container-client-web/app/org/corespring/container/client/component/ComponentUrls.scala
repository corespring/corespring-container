package org.corespring.container.client.component

import org.corespring.container.client.cache.{PreCache, ContainerCache}
import play.api.http.ContentTypes

trait ComponentUrls {

  implicit def cache: ContainerCache

  /** return a url where this hashed asset is available */
  protected def jsPath(hash: String): String

  /** return a url where this hashed asset is available */
  protected def cssPath(hash: String): String

  private def typesHash(types: Seq[String]) = types.sorted.mkString(",").hashCode

  def jsUrl(context: String, types: Seq[String], make: => String): String = url(s"$context-js", ContentTypes.JAVASCRIPT, jsPath, types, make)

  def cssUrl(context: String, types: Seq[String], make: => String): String = url(s"$context-css", ContentTypes.CSS, cssPath, types, make)

  private def url(prefix: String, contentType : String, pathFn: String => String, types: Seq[String], make: => String): String = {

    val hash = s"$prefix-${typesHash(types)}"

    if (!cache.has(hash)) {
      PreCache(
        hash,
        play.api.mvc.Results.Ok(make).as(contentType)
      )
    }
    pathFn(hash)
  }
}
