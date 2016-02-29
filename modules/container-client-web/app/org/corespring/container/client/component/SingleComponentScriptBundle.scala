package org.corespring.container.client.component

import org.corespring.container.components.model.{Component, ComponentInfo}

trait Bundle{
  def js : Seq[String]
  def css : Seq[String]
}

case class SingleComponentScriptBundle(component: ComponentInfo,
  js: Seq[String],
  css: Seq[String],
  ngModules: Seq[String]) extends Bundle {
  def componentType: String = component.componentType
}

case class ComponentsScriptBundle(components: Seq[Component],
                                       js: Seq[String],
                                       css: Seq[String],
                                       ngModules: Seq[String]) extends Bundle{
  def componentTypes: Seq[String] = components.map(_.componentType)
}
