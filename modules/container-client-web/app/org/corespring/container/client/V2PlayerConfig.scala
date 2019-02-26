package org.corespring.container.client

import play.api.libs.json.{Json}


case class ServiceWorkerConfig(path:Option[String], cdn:Option[String], saveSession: Option[String] = None){

  def toJson =  {
    Json.writes[ServiceWorkerConfig].writes(this)
  }
}

/**
 * @param rootUrl
 * @param newRelicRumConfig
 * @param launchTimeout - how long should the launcher wait for the underlying instance to be ready (default: 0 - aka no timeout)
 */
case class V2PlayerConfig(
  rootUrl: Option[String],
  newRelicRumConfig: Option[NewRelicRumConfig],
  launchTimeout: Int = 0,
  serviceWorker: Option[ServiceWorkerConfig] = None) {
  val useNewRelic = newRelicRumConfig.isDefined
}

