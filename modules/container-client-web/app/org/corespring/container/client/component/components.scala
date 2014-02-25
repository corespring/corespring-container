package org.corespring.container.client.component

import org.corespring.container.components.model.{ LayoutComponent, Library, UiComponent, Component }

trait ComponentTypeFilter {
  def filterByType[T](comps: Seq[Component])(implicit m: scala.reflect.Manifest[T]): Seq[T] = comps.filter(c => m.runtimeClass.isInstance(c)).map(_.asInstanceOf[T])
}

trait HasComponents {
  def components: Seq[Component]
}

trait ComponentSplitter extends HasComponents with ComponentTypeFilter {

  def uiComponents: Seq[UiComponent] = filterByType[UiComponent](components)

  def libraries: Seq[Library] = filterByType[Library](components)

  def layoutComponents: Seq[LayoutComponent] = filterByType[LayoutComponent](components)
}

