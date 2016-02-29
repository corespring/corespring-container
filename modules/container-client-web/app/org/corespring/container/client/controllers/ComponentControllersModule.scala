package org.corespring.container.client.controllers

import com.softwaremill.macwire.MacwireMacros.wire

trait ComponentControllersModule {

  def componentSets : ComponentSets = wire[ComponentSets]
  def componentsFileController : ComponentsFileController = wire[ComponentsFileController]
}
