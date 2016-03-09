package org.corespring.container.client

import play.api.Configuration

case class V2PlayerConfig(rootUrl: Option[String], newRelicRumConfig: Option[NewRelicRumConfig]) {
  val useNewRelic = newRelicRumConfig.isDefined
}

object V2PlayerConfig {

  def empty = V2PlayerConfig(None, None)

  def apply(rootConfig: Configuration): V2PlayerConfig = {
    rootConfig.getConfig("corespring.v2player").map { c =>
      lazy val rootUrl: Option[String] = c.getString("rootUrl")
      lazy val nrConfig = for {
        enabled <- c.getBoolean("newrelic.enabled")
        if enabled
        licenseKey <- c.getString("newrelic.license-key")
        applicationID <- c.getString("newrelic.application-id ")
      } yield NewRelicRumConfig(licenseKey, applicationID)

      V2PlayerConfig(rootUrl, nrConfig)

    }.getOrElse(
      V2PlayerConfig.empty)
  }
}

