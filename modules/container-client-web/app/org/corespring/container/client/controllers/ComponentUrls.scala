package org.corespring.container.client.controllers

trait ComponentUrls {

  def cache: ContainerCache

  /** return a url where this hashed asset is available */
  protected def jsPath(hash: String): String

  /** return a url where this hashed asset is available */
  protected def cssPath(hash: String): String

  private def typesHash(types: Seq[String]) = types.sorted.mkString(",").hashCode

  def jsUrl(context:String, types: Seq[String], make: => String): String = url(s"$context-js", jsPath, types, make)

  def cssUrl(context:String, types: Seq[String], make: => String): String = url(s"$context-css", cssPath, types, make)

  private def url(prefix: String, pathFn : String => String, types: Seq[String], make: => String): String = {

    val hash = s"$prefix-${typesHash(types)}"

    if (!cache.has(hash)) {
      cache.set(hash, make)
    }
    pathFn(hash)
  }
}
