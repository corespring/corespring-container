package org.corespring.container.client.controllers.apps

import play.api.mvc.Call

trait CallCreator {
  def wrap(c: Call): Call
}
