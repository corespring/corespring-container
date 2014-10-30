package org.corespring.container.client

import play.api.Configuration
import play.api.libs.json.{Json, JsValue, Writes}

object V2PlayerConfig {
  def apply(rootConfig: Configuration) = {
    println(s"++++++++++++++++++++++++++++++++ V2PlayerConfig $rootConfig")
    new V2PlayerConfig(rootConfig.getConfig("corespring.v2player"))
  }
}

class V2PlayerConfig(val underlying: Option[Configuration]) {
  lazy val rootUrl: Option[String] = underlying.map { c =>
    c.getString("rootUrl")
  }.flatten

  lazy val newRelicRumConfig: Option[NewRelicRumConfig] = {
    underlying.map { c =>
      c.getBoolean("newrelic.enabled") match {
        case Some(true) => Some(NewRelicRumConfig(
          licenseKey = c.getString("newrelic.license-key").getOrElse(""),
          applicationID = c.getString("newrelic.application-id ").getOrElse("")))
        case _ => None
      }
    }.getOrElse(None)
  }
}

object NewRelicRumConfig {
  implicit val writes = new Writes[NewRelicRumConfig] {
    def writes(c: NewRelicRumConfig): JsValue = {
      Json.obj(
        "licenseKey" -> c.licenseKey,
        "applicationID" -> c.applicationID,
        "sa" -> c.sa,
        "beacon" -> c.beacon,
        "errorBeacon" -> c.errorBeacon,
        "agent" -> c.agent
      )
    }
  }
}

case class NewRelicRumConfig(
  licenseKey: String,
  applicationID: String,
  sa: Int = 1,
  beacon: String = "bam.nr-data.net",
  errorBeacon: String = "bam.nr-data.net",
  agent: String = "js-agent.newrelic.com/nr-476.min.js")


