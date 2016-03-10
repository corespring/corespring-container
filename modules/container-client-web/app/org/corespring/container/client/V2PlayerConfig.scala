package org.corespring.container.client

case class V2PlayerConfig(rootUrl: Option[String], newRelicRumConfig: Option[NewRelicRumConfig]) {
  val useNewRelic = newRelicRumConfig.isDefined
}

