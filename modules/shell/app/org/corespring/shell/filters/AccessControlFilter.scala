package org.corespring.shell.filters

import org.corespring.container.client.HasContext
import play.api.mvc.{ EssentialAction, EssentialFilter, RequestHeader }

object AccessControlFilter extends EssentialFilter with HasContext {

  val AccessControlAllowEverything = ("Access-Control-Allow-Origin", "*")

  def apply(next: EssentialAction) = new EssentialAction {

    def apply(request: RequestHeader) = {
      next(request).map(result =>
        result.withHeaders(AccessControlAllowEverything)
          .withHeaders(("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS"))
          .withHeaders(("Access-Control-Allow-Headers", "x-requested-with,Content-Type,Authorization")))
    }
  }
}
