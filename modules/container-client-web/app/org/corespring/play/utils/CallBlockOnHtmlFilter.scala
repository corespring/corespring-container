package org.corespring.play.utils

import play.api.mvc.{RequestHeader, EssentialAction, EssentialFilter}
import play.api.Mode

/** Dev mode support for re-loading components if the player or editor is loaded.
 */
object CallBlockOnHtmlFilter extends EssentialFilter {

  var block: () => Unit = null

  def apply(next: EssentialAction) = new EssentialAction {

    def apply(request: RequestHeader) = {
      play.api.Play.current.mode match {
        case Mode.Dev => {
          if (request.path.contains(".html") && block != null) {
            block()
          }
          next(request)
        }
        case _ => next(request)
      }
    }
  }
}
