package org.corespring.container.client.controllers.apps

import play.api.{Logger, Mode, Play}
import play.api.mvc.RequestHeader

trait JsModeReading {

  lazy val logger = Logger("container.player.jsMode")

  def getJsMode(r: RequestHeader): String = {


    logger.trace(s"queryString -> ${r.queryString.mkString(",")}")

    val maybeJsMode = r.queryString.get("jsMode")
    logger.trace(s"jsMode -> $maybeJsMode")

    val mode = maybeJsMode.map(_.head)
    logger.trace(s"found mode: $mode")

    def fromApp: String = Play.current.mode match {
      case Mode.Test => "dev"
      case m => m.toString.toLowerCase
    }

    mode.map { m =>
      m match {
        case s if (s != "prod" && s != "dev") => fromApp
        case s => s
      }
    }.getOrElse(fromApp)
  }
}
