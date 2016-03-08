package org.corespring.container.components.services

import org.corespring.container.components.model.Component

trait ComponentTypeFilter {
  protected def filterByType[T](comps: Seq[Component])(implicit m: scala.reflect.Manifest[T]): Seq[T] = comps.filter(c => m.runtimeClass.isInstance(c)).map(_.asInstanceOf[T])
}
