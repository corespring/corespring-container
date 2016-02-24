package org.corespring.container.client.component

import org.corespring.container.components.model.ComponentInfo

case class SingleComponentScriptBundle(component: ComponentInfo,
  js: Seq[String],
  css: Seq[String],
  ngModules: Seq[String]) {
  def componentType: String = component.componentType
}

case class ComponentsScriptBundle(components: Seq[ComponentInfo],
                                       js: Seq[String],
                                       css: Seq[String],
                                       ngModules: Seq[String]) {
  def componentTypes: Seq[String] = components.map(_.componentType)
}
