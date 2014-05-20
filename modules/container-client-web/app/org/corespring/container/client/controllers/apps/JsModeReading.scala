package org.corespring.container.client.controllers.apps

import play.api.mvc.RequestHeader
import play.api.{Mode, Play}

trait JsModeReading {

  def getJsMode(r: RequestHeader): String = {

    val mode = r.queryString.get("jsMode").map(_.head)

    def fromApp: String = Play.current.mode match {
      case Mode.Test => "dev"
      case m => m.toString.toLowerCase
    }

    mode.map { m =>
      m match {
        case s if (s != "prod" || s != "dev") => fromApp
        case s => s
      }
    }.getOrElse(fromApp)
  }
}
