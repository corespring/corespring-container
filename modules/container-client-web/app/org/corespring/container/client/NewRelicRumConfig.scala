package org.corespring.container.client

import play.api.libs.json.Json

case class NewRelicRumConfig(
  licenseKey: String,
  applicationID: String,
  sa: Int = 1,
  beacon: String = "bam.nr-data.net",
  errorBeacon: String = "bam.nr-data.net",
  agent: String = "js-agent.newrelic.com/nr-476.min.js") {
  val json = Json.writes[NewRelicRumConfig].writes(this)
}