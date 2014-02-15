package org.corespring.container.client.cache

import scala.concurrent.duration.Duration
import scala.reflect.ClassTag

trait ContainerCache {

  def uid : String

  def has(key:String) : Boolean

  def set(key: String, value: Any, expiration: Int = 600): Unit

  def set(key: String, value: Any, expiration: Duration): Unit

  def get(key: String): Option[Any]

  def getOrElse[A : ClassTag](key: String, expiration: Int = 0)(orElse: => A): A

  def getAs[T](key: String): Option[T]

  def remove(key: String)
}
