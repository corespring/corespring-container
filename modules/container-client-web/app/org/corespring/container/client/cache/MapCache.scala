package org.corespring.container.client.cache

import scala.concurrent.duration.Duration
import scala.reflect.ClassTag

class MapCache extends ContainerCache{

  import scala.collection.mutable

  private val data: mutable.Map[String, Any] = mutable.Map()

  override def remove(key: String): Unit = data.remove(key)

  override def get(key: String): Option[String] = data.get(key).map(_.asInstanceOf[String])

  override def getAs[T](key: String): Option[T] = data.get(key).map(_.asInstanceOf[T])

  override def getOrElse[A : ClassTag](key: String, expiration: Int)(orElse: => A): A = data.get(key).map(_.asInstanceOf[A]).getOrElse(orElse)

  override def set(key: String, value: Any, expiration: Duration): Unit = data.put(key, value)

  override def set(key: String, value: Any, expiration: Int): Unit = data.put(key, value)

  override def has(key: String): Boolean = data.contains(key)

  override def uid: String = "cache1"
}
