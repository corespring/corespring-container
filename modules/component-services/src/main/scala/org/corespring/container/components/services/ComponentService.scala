package org.corespring.container.components.services

import org.corespring.container.components.model._

trait ComponentService {
  private def filterByType[T](comps: Seq[Component])(implicit m: scala.reflect.Manifest[T]): Seq[T] = comps.filter(c => m.runtimeClass.isInstance(c)).map(_.asInstanceOf[T])
  def components : Seq[Component]
  def interactions: Seq[Interaction] = filterByType[Interaction](components)
  def libraries: Seq[Library] = filterByType[Library](components)
  def layoutComponents: Seq[LayoutComponent] = filterByType[LayoutComponent](components)
  def widgets: Seq[Widget] = filterByType[Widget](components)
}

