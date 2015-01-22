package org.corespring.container.client

import java.io.File
import java.util.Properties
import org.apache.commons.io.FileUtils
import play.api.Play
import play.api.Play.current
import play.api.libs.json.{ JsNull, JsValue, JsObject, Json }

case class VersionInfo(version: String, branch: String, commitHash: String, date: String)

object VersionInfo {
  def make = {
    new VersionInfo(version, branch, commitHashShort, pushDate)
  }

  def json = {
    val compInfo: JsValue = components.getOrElse(JsNull)
    Json.obj(
      "version" -> version,
      "commitHash" -> commitHashShort,
      "branch" -> branch,
      "date" -> pushDate,
      "corespring-components" -> compInfo)
  }

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

  private lazy val components: Option[JsValue] = {
    for {
      path <- Play.current.configuration.getString("components.path")
      comps <- {
        val f = new File(path)
        if (f.exists) Some(f) else None
      }
      versionFile <- comps.getParentFile.listFiles().find(_.getName == "version-info.json")
      jsonString <- Some(FileUtils.readFileToString(versionFile))
      json <- Some(Json.parse(jsonString))
    } yield json
  }

  private lazy val commitHashShort: String = properties.getProperty("commit.hash", "?")
  private lazy val pushDate: String = properties.getProperty("date", "?")
  private lazy val branch: String = properties.getProperty("branch", "?")
  private lazy val version: String = properties.getProperty("version", "?")
}
