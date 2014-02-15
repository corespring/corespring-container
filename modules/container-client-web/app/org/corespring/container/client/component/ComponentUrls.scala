package org.corespring.container.client.component

import org.corespring.container.components.model.Component


trait ComponentUrls {
  def jsUrl(context:String, components: Seq[Component]) : String
  def cssUrl(context:String, components:Seq[Component]) : String
}

/*trait ComponentUrls {

  implicit def cache: ContainerCache

  /** return a url where this hashed asset is available */
  protected def jsPath(hash: String): String

  /** return a url where this hashed asset is available */
  protected def cssPath(hash: String): String

  protected def generateCss(types:Seq[String]) : String
  protected def generateJs(types:Seq[String]) : String

  private def typesHash(types: Seq[String]) = types.sorted.mkString(",").hashCode

  def jsUrl(context: String, types: Seq[String]): String = url(s"$context-js", ContentTypes.JAVASCRIPT, jsPath, types)

  def cssUrl(context: String, types: Seq[String]): String = url(s"$context-css", ContentTypes.CSS, cssPath, types)

  private def url(prefix: String, contentType : String, pathFn: String => String, types: Seq[String]): String = {

    val hash = s"$prefix-${typesHash(types)}"

    generate(types)
    /*if (!cache.has(hash)) {
      PreCache(
        hash,
        play.api.mvc.Results.Ok(generate(types)).as(contentType)
      )
    }*/
    pathFn(hash)
  }
}*/
