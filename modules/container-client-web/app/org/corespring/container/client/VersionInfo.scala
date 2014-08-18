package org.corespring.container.client

import java.util.Properties
import play.api.Play
import play.api.Play.current
import play.api.libs.json.Json

case class VersionInfo(version: String, branch: String, commitHash: String, date: String)

object VersionInfo {
  def make = {
    new VersionInfo(version, branch, commitHashShort, pushDate)
  }

  def json = Json.obj(
    "version" -> version,
    "commitHash" -> commitHashShort,
    "branch" -> branch,
    "date" -> pushDate)

  val propsFile = "/container-client-web-buildInfo.properties"

  private lazy val properties = {
    val url = Play.resource(propsFile)
    url.map {
      u =>
        val props = new Properties()
        props.load(u.openStream())
        props
    }.getOrElse(new Properties())
  }

  private lazy val commitHashShort: String = properties.getProperty("commit.hash", "?")
  private lazy val pushDate: String = properties.getProperty("date", "?")
  private lazy val branch: String = properties.getProperty("branch", "?")
  private lazy val version: String = properties.getProperty("version", "?")
}
