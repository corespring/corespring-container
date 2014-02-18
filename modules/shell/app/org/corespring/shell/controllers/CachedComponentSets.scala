package org.corespring.shell.controllers

import org.corespring.container.client.controllers.DefaultComponentSets
import play.api.cache.Cached
import play.api.mvc.{EssentialAction, AnyContent}

/**
 * An example of component sets with caching.
 */
trait CachedComponentSets extends DefaultComponentSets {

  import play.api.Play.current

  override def resource[A >: EssentialAction](context: String, directive: String, suffix: String) = {
    Cached(s"$context-$directive-$suffix") {
      super.resource(context, directive, suffix)
    }
  }
}
