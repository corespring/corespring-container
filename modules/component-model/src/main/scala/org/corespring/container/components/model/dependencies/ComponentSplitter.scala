package org.corespring.container.components.model.dependencies

import org.corespring.container.components.model.{ LayoutComponent, Library, UiComponent }

trait ComponentSplitter extends HasComponents with ComponentTypeFilter {

  def uiComponents: Seq[UiComponent] = filterByType[UiComponent](components)

  def libraries: Seq[Library] = filterByType[Library](components)

  def layoutComponents: Seq[LayoutComponent] = filterByType[LayoutComponent](components)
}
