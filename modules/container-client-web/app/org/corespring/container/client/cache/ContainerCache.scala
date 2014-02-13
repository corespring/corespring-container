package org.corespring.container.client.cache

import scala.concurrent.duration.Duration

trait ContainerCache {

  def has(key:String) : Boolean

  def set(key: String, value: Any, expiration: Int = 0): Unit

  def set(key: String, value: Any, expiration: Duration): Unit

  def get(key: String): Option[Any]

  def getOrElse[A](key: String, expiration: Int = 0)(orElse: => A): A

  def getAs[T](key: String): Option[T]

  def remove(key: String)
}
