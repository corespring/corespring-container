package org.corespring.container.client.cache

import play.api._
import play.api.http.HeaderNames.{IF_NONE_MATCH, ETAG, EXPIRES}
import play.api.libs.iteratee.{Iteratee, Done}
import play.api.mvc.Results.NotModified
import play.api.mvc._
import scala.concurrent.ExecutionContext


object Cached {

  def apply(key: RequestHeader => String)(action: EssentialAction)(implicit app: play.api.Application, cache: ContainerCache): Cached = {
    apply(key, duration = 0)(action)
  }

  def apply(key: String)(action: EssentialAction)(implicit app: play.api.Application, cache: ContainerCache): Cached = {
    apply(key, duration = 0)(action)
  }

  def apply(key: String, duration: Int)(action: EssentialAction)(implicit app: play.api.Application, cache: ContainerCache): Cached = {
    Cached(_ => key, duration)(action)
  }
}


/**
 * Lifted from the play framework but not using the object Cache.
 * This saves us from requiring play-cache as a dependency and defines the contract with a trait.
 */
case class Cached(key: RequestHeader => String, duration: Int)(action: EssentialAction)(implicit app: Application, cache: ContainerCache) extends EssentialAction {

  private lazy val logger = Logger("container.cached")

  import ExecutionContext.Implicits.global

  def apply(request: RequestHeader): Iteratee[Array[Byte], SimpleResult] = {

    val resultKey = key(request)
    val etagKey = s"$resultKey-etag"
    logger.debug(s"resultKey: $resultKey")
    logger.debug(s"etagKey: $etagKey")

    // Has the client a version of the resource as fresh as the last one we served?
    val notModified = for {
      requestEtag <- request.headers.get(IF_NONE_MATCH)
      etag <- cache.getAs[String](etagKey)
      if requestEtag == "*" || etag == requestEtag
    } yield Done[Array[Byte], SimpleResult](NotModified)

    notModified.orElse(
      // Otherwise try to serve the resource from the cache, if it has not yet expired
      cache.getAs[SimpleResult](resultKey).map(Done[Array[Byte], SimpleResult](_))
    ).getOrElse {
      // The resource was not in the cache, we have to run the underlying action
      val iterateeResult = action(request)
      val durationMilliseconds = if (duration == 0) 1000 * 60 * 60 * 24 * 365 else duration * 1000 // Set client cache expiration to one year for “eternity” duration
      val expirationDate = http.dateFormat.print(System.currentTimeMillis() + durationMilliseconds)
      // Generate a fresh ETAG for it
      val etag = expirationDate // Use the expiration date as ETAG
      // Add cache information to the response, so clients can cache its content
      iterateeResult.map {
        result =>
          val resultWithHeaders = result.withHeaders(ETAG -> etag, EXPIRES -> expirationDate)
          cache.set(etagKey, etag, duration) // Cache the new ETAG of the resource
          cache.set(resultKey, resultWithHeaders, duration) // Cache the new SimpleResult of the resource
          resultWithHeaders
      }
    }
  }

}
