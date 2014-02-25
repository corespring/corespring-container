package org.corespring.shell.filters

import play.api.mvc.{ RequestHeader, EssentialAction, EssentialFilter }
import scala.concurrent.ExecutionContext

object AccessControlFilter extends EssentialFilter {

  import ExecutionContext.Implicits.global

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
