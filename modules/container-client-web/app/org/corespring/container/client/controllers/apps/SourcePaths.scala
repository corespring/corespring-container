package org.corespring.container.client.controllers.apps

import java.net.URL

import play.api.Play
import play.api.libs.json.Json

trait SourcePaths {
  def src: Seq[String]

  def dest: String

  def otherLibs: Seq[String]
}

case class CssSourcePaths(src: Seq[String], dest: String, otherLibs: Seq[String]) extends SourcePaths

case class NgSourcePaths(src: Seq[String], dest: String, otherLibs: Seq[String], ngModules: Seq[String]) extends SourcePaths

object NgSourcePaths {

  def fromJsonResource(prefix: String, r: String): NgSourcePaths = {
    SourcePaths.fromJsonResource(prefix, r) match {
      case ng: NgSourcePaths => ng
      case _ => throw new RuntimeException(s"Not the right source path type: $r")
    }
  }
}

object CssSourcePaths {

  def fromJsonResource(prefix: String, r: String): CssSourcePaths = {
    SourcePaths.fromJsonResource(prefix, r) match {
      case css: CssSourcePaths => css
      case _ => throw new RuntimeException(s"Not the right source path type: $r")
    }
  }
}

object SourcePaths {

  import org.corespring.container.logging.ContainerLogger

  private val logger = ContainerLogger.getLogger("SourcePaths")

  import play.api.Play.current

  def fromJsonResource(prefix: String, r: String): SourcePaths = {

    def prefixModule(p: String) = if (p.startsWith("//")) p else s"$prefix$p"

    logger.info(s"load json resource: $prefix, $r")

    Play.resource(r).map { u: URL =>
      val bs = scala.io.Source.fromURL(u)
      val jsonString: String = bs.getLines().mkString("\n")
      bs.close()
      val json = Json.parse(jsonString)
      val src = (json \ "src").as[Seq[String]].map(prefixModule)
      val dest = s"$prefix${(json \ "dest").as[String]}"
      val otherLibs = (json \ "libs").as[Seq[String]].map(prefixModule)

      (json \ "ngModules").asOpt[Seq[String]].map { ngModules =>
        NgSourcePaths(src, dest, otherLibs, ngModules)
      }.getOrElse(
        CssSourcePaths(src, dest, otherLibs))
    }.getOrElse(throw new RuntimeException(s"Error reading src paths: $r"))
  }
}
