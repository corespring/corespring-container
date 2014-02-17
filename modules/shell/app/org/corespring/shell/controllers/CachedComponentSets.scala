package org.corespring.shell.controllers

import org.corespring.container.client.controllers.DefaultComponentSets
import play.api.cache.Cached
import play.api.mvc.{AnyContent, Action}

/**
 * An example of component sets with caching.
 */
trait CachedComponentSets extends DefaultComponentSets {

  import play.api.Play.current

  override def resource(context: String, directive: String, suffix: String): Action[AnyContent] = {
    Cached(s"$context-$directive-$suffix") {
      super.resource(context, directive, suffix)
    }.asInstanceOf[Action[AnyContent]]
  }
}
