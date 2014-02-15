package org.corespring.shell.cache

import org.corespring.container.client.cache.ContainerCache
import scala.reflect.ClassTag
import scala.concurrent.duration.Duration

class PlayCacheProxy extends ContainerCache {

  import play.api.cache.Cache
  import play.api.Play.current

  private val _uid = s"${math.random}"

  override def uid: String = _uid

  override def has(key: String): Boolean = Cache.get(key).isDefined

  override def remove(key: String): Unit = Cache.remove(key)

  override def getOrElse[A: ClassTag](key: String, expiration: Int)(orElse: => A): A = {
    Cache.getOrElse(key, expiration)(orElse)
  }

  override def getAs[T](key: String): Option[T] = Cache.getAs(key)

  override def get(key: String): Option[Any] = Cache.get(key)

  override def set(key: String, value: Any, expiration: Duration): Unit = {
    Cache.set(key, value, expiration)
  }

  override def set(key: String, value: Any, expiration: Int): Unit = {
    Cache.set(key, value, expiration)
  }

}
