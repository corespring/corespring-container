package org.corespring.container.components.model.dependencies

import org.corespring.container.components.model.Component

trait HasComponents {
  def components: Seq[Component]
}

