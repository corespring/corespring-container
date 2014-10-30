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
    underlying.map { c =>
      c.getBoolean("newrelic.enabled") match {
        case Some(true) => Some(Json.toJson(NewRelicRumConfig(
          licenseKey = c.getString("newrelic.license-key").getOrElse(""),
          applicationID = c.getString("newrelic.application-id ").getOrElse(""))))
        case _ => None
      }
    }.getOrElse(None)
  }
}





