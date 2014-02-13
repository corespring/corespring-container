package org.corespring.container.client.cache

trait ContainerCache {

  def get(key: String): Option[String]

  def has(key: String): Boolean

  def set(key: String, value: String): Unit

  def remove(key: String): Unit
}
