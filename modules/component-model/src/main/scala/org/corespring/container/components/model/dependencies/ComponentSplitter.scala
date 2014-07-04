package org.corespring.container.components.model.dependencies

import org.corespring.container.components.model.{ LayoutComponent, Library, Interaction }

trait ComponentSplitter extends HasComponents with ComponentTypeFilter {

  def interactions: Seq[Interaction] = filterByType[Interaction](components)

  def libraries: Seq[Library] = filterByType[Library](components)

  def layoutComponents: Seq[LayoutComponent] = filterByType[LayoutComponent](components)
}
