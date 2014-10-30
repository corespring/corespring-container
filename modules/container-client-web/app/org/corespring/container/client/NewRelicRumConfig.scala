package org.corespring.container.client

import play.api.libs.json.{ Json, JsValue, Writes }

object NewRelicRumConfig {
  implicit val writes = new Writes[NewRelicRumConfig] {
    def writes(c: NewRelicRumConfig): JsValue = {
      Json.obj(
        "licenseKey" -> c.licenseKey,
        "applicationID" -> c.applicationID,
        "sa" -> c.sa,
        "beacon" -> c.beacon,
        "errorBeacon" -> c.errorBeacon,
        "agent" -> c.agent)
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