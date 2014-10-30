package org.corespring.container.client

import play.api.libs.json.{ Json, JsValue, Writes }

object NewRelicRumConfig {
  implicit val writes : Writes[NewRelicRumConfig] = Json.writes[NewRelicRumConfig]
}

case class NewRelicRumConfig(
  licenseKey: String,
  applicationID: String,
  sa: Int = 1,
  beacon: String = "bam.nr-data.net",
  errorBeacon: String = "bam.nr-data.net",
  agent: String = "js-agent.newrelic.com/nr-476.min.js")