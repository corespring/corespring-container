package org.corespring.container.components.loader

import org.corespring.container.components.model.Component

trait ComponentLoader {

  def all : Seq[Component]

  def reload : Unit
}
