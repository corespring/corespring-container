package org.corespring.container.client.controllers

trait TypesRouter {

  def cache: ContainerCache

  /** return a url where this hashed asset is available */
  protected def jsPath(hash: String): String

  /** return a url where this hashed asset is available */
  protected def cssPath(hash: String): String

  private def typesHash(types: Seq[String]) = types.sorted.mkString(",").hashCode

  def jsUrl(types: Seq[String], make: Seq[String] => String): String = url("js", jsPath, types, make)

  def cssUrl(types: Seq[String], make: Seq[String] => String): String = url("css", cssPath, types, make)

  private def url(prefix: String, pathFn : String => String, types: Seq[String], make: Seq[String] => String): String = {

    val hash = s"$prefix-${typesHash(types)}}"

    if (!cache.has(hash)) {
      cache.set(hash, make(types))
    }
    pathFn(hash)
  }
}
