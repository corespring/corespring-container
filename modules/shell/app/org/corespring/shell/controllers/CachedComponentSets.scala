package org.corespring.shell.controllers

import org.corespring.container.client.controllers.ComponentSets
import play.api.cache.Cached
import play.api.mvc.EssentialAction

/**
 * An example of component sets with caching.
 */
trait CachedComponentSets extends ComponentSets {

  import play.api.Play.current

  override def resource(context: String, directive: String, suffix: String): EssentialAction = {
    Cached(s"$context-$directive-$suffix") {
      super.resource(context, directive, suffix)
    }
  }
}
