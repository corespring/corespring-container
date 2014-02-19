package org.corespring.container.client.component

import org.corespring.container.components.model.Component

trait ComponentUrls {
  def jsUrl(context:String, components: Seq[Component]) : String
  def cssUrl(context:String, components:Seq[Component]) : String
}

