package org.corespring.shell.impl.filters


import org.corespring.container.components.loader.ComponentLoader
import play.api.Mode
import play.api.mvc.{RequestHeader, EssentialAction, EssentialFilter}


/**
 * Dev mode support for re-loading components if the player or editor is loaded.
 */
object ReloadComponentsFilter extends EssentialFilter {

  var components: ComponentLoader = null

  def apply(next: EssentialAction) = new EssentialAction {

    def apply(request: RequestHeader) = {
      play.api.Play.current.mode match {
        case Mode.Dev => {
          if (request.path.contains("index.html")  && components != null) {
            components.reload
          }
          next(request)
        }
        case _ => next(request)
      }
    }
  }
}
