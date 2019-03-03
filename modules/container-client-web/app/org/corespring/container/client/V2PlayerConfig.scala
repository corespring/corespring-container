package org.corespring.container.client


/**
 * @param rootUrl
 * @param newRelicRumConfig
 * @param launchTimeout - how long should the launcher wait for the underlying instance to be ready (default: 0 - aka no timeout)
 */
case class V2PlayerConfig(
  rootUrl: Option[String],
  newRelicRumConfig: Option[NewRelicRumConfig],
  launchTimeout: Int = 0) {
  val useNewRelic = newRelicRumConfig.isDefined
}

