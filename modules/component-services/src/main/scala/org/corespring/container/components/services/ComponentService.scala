package org.corespring.container.components.services

import org.corespring.container.components.model._

trait ComponentService extends ComponentTypeFilter {
  def components: Seq[Component]
  def interactions: Seq[Interaction] = filterByType[Interaction](components)
  def libraries: Seq[Library] = filterByType[Library](components)
  def layoutComponents: Seq[LayoutComponent] = filterByType[LayoutComponent](components)
  def widgets: Seq[Widget] = filterByType[Widget](components)
}

