package org.corespring.container.client

import play.api.Configuration

object V2PlayerConfig{
  def apply(rootConfig:Configuration) = {
    new V2PlayerConfig(rootConfig.getConfig("corespring.v2player"))
  }
}

class V2PlayerConfig(val underlying:Option[Configuration]) {
  lazy val rootUrl : Option[String] = underlying.map{ c =>
    c.getString("rootUrl")
  }.flatten
}
