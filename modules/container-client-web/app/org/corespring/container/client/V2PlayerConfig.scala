package org.corespring.container.client

import play.api.Configuration
import play.api.libs.json.{Json, JsValue, Writes}

object V2PlayerConfig {
  def apply(rootConfig: Configuration) = {
    new V2PlayerConfig(rootConfig.getConfig("corespring.v2player"))
  }
}

class V2PlayerConfig(val underlying: Option[Configuration]) {

  lazy val rootUrl: Option[String] = underlying.map { c =>
    c.getString("rootUrl")
  }.flatten

  lazy val newRelicRumConfig: Option[JsValue] = {
    import NewRelicRumConfig.writes

    for {
      map <- underlying
      enabled <- map.getBoolean("newrelic.enabled")
      if enabled
      licenseKey <- map.getString("newrelic.license-key")
      applicationID <- map.getString("newrelic.application-id ")
    } yield {
      Json.toJson(NewRelicRumConfig(licenseKey, applicationID))
    }
  }
}





