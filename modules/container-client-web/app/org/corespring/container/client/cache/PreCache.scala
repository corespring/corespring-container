package org.corespring.container.client.cache

import play.api.http.HeaderNames.{ETAG, EXPIRES}
import play.api.mvc.SimpleResult
import play.api.{http, Logger}

/**
 * Precache a result for later retrieval
 */
object PreCache {

  lazy val logger = Logger("container.cache.precache")

  def etagKey(key: String) = s"$key-etag"

  def apply(key: String, result: SimpleResult)(implicit cache: ContainerCache) = {
    logger.debug(s"key: $key")
    logger.debug(s"etagKey: ${etagKey(key)}")
    val durationMilliseconds = 1000 * 60 * 60 * 24 * 365
    val expirationDate = http.dateFormat.print(System.currentTimeMillis() + durationMilliseconds)
    val etag = expirationDate
    val resultWithHeaders = result.withHeaders(ETAG -> etag, EXPIRES -> expirationDate)
    cache.set(etagKey(key), etag)
    cache.set(key, resultWithHeaders)
  }
}
