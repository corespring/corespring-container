package org.corespring.container.components.services

import org.corespring.container.components.model._

trait ComponentService extends ComponentTypeFilter {

  def components: Seq[Component]

  def interactions: Seq[Interaction] = interactions(true)

  def interactions(showNonReleased: Boolean): Seq[Interaction] = {
    filterByType[Interaction](components).filter(showNonReleased || _.released)
  }

  def libraries: Seq[Library] = filterByType[Library](components)

  def layoutComponents: Seq[LayoutComponent] = layoutComponents(true)

  def layoutComponents(showNonReleased: Boolean): Seq[LayoutComponent] = {
    filterByType[LayoutComponent](components).filter(showNonReleased || _.released)
  }

  def widgets: Seq[Widget] = widgets(true)

  def widgets(showNonReleased: Boolean): Seq[Widget] = {
    filterByType[Widget](components).filter(showNonReleased || _.released)
  }
}

