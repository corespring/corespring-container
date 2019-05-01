package org.corespring.container.client

import play.api.mvc.Call

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

case class Endpoint(method:String, url: String) {
  def toCall(kv: (String,String)*) : Call = {
    val preppedUrl = kv.foldLeft(this.url)( (u, t) => {
      val (k,v) = t
      u.replace(k,v)
    })
    Call(this.method, preppedUrl)
  }
}
case class EndpointConfig(saveSession: Option[Endpoint])

