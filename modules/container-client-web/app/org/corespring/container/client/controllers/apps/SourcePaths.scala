package org.corespring.container.client.controllers.apps

import java.net.URL

import play.api.Play
import play.api.libs.json.Json

case class SourcePaths(src: Seq[String], dest: String, otherLibs: Seq[String])

object SourcePaths {

  import play.api.Play.current

  def fromJsonResource(prefix: String, r: String): SourcePaths = {

    def prefixModule(p: String) = if (p.startsWith("//")) p else s"$prefix$p"

    Play.resource(r).map { u: URL =>
      val bs = scala.io.Source.fromURL(u)
      val jsonString: String = bs.getLines().mkString("\n")
      bs.close()
      val json = Json.parse(jsonString)
      val src = (json \ "src").as[Seq[String]].map(prefixModule)
      val dest = s"$prefix${(json \ "dest").as[String]}"
      val otherLibs = (json \ "libs").as[Seq[String]].map(prefixModule)
      SourcePaths(src, dest, otherLibs)
    }.getOrElse(throw new RuntimeException(s"Error reading src paths: $r"))
  }
}
