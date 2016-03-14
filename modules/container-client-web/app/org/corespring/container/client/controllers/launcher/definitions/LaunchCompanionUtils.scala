package org.corespring.container.client.controllers.launcher.definitions

import play.api.mvc.RequestHeader

private[launcher] trait LaunchCompanionUtils {
  def params(rh: RequestHeader) = rh.queryString.mapValues(_.mkString(""))
}
