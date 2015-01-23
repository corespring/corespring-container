package org.corespring.container.client

import java.io.File
import java.util.Properties
import org.apache.commons.io.FileUtils
import play.api.{ Configuration, Logger, Play }
import play.api.Play.current
import play.api.libs.json.{ JsObject, JsValue, Json }

object VersionInfo {

  private def logger = Logger("VersionInfo")

  val propsFile = "/container-client-web-buildInfo.properties"

  private lazy val properties = {
    val url = Play.resource(propsFile)
    url.map {
      u =>
        val input = u.openStream()
        val props = new Properties()
        props.load(input)
        input.close()
        props
    }.getOrElse(new Properties())
  }

  private lazy val commitHashShort: String = properties.getProperty("commit.hash", "?")
  private lazy val pushDate: String = properties.getProperty("date", "?")
  private lazy val branch: String = properties.getProperty("branch", "?")
  private lazy val version: String = properties.getProperty("version", "?")

  def apply(config: Configuration): JsObject = {

    val components: Option[JsValue] = {

      val maybePath = config.getString("components.path")
      logger.trace(s"components-path=$maybePath")

      for {
        path <- maybePath
        versionFile <- {
          val f = new File(s"$path/version-info.json")
          logger.trace(s"version-info=${f.getPath}, exists=${f.exists}, absolute-path=${f.getAbsolutePath}")
          if (f.exists) Some(f) else None
        }
        jsonString <- Some(FileUtils.readFileToString(versionFile))
        json <- {
          try {
            Some(Json.parse(jsonString))
          } catch {
            case t: Throwable => {
              logger.warn(s"Error parsing json: $jsonString, from file: ${versionFile.getAbsolutePath}")
              None
            }
          }
        }
      } yield {
        logger.trace(s"return the json: $jsonString")
        json
      }
    }

    val comps: JsValue = components.getOrElse(Json.obj())

    Json.obj(
      "version" -> version,
      "commitHash" -> commitHashShort,
      "branch" -> branch,
      "date" -> pushDate,
      "corespring-components" -> comps)

  }

}
