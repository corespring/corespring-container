package org.corespring.container.client.component

import org.corespring.container.components.model.Component
import play.api.mvc.Controller

trait ComponentUrls extends Controller {
  def jsUrl(context:String, components: Seq[Component]) : String
  def cssUrl(context:String, components:Seq[Component]) : String
}

