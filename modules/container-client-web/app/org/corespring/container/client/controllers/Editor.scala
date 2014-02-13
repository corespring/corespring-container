package org.corespring.container.client.controllers

import org.corespring.container.client.component.AllItemTypesReader
import play.api.mvc.Action

trait Editor extends AllItemTypesReader with App{
  override def context: String = "editor"

  def services = Action(Ok(""))

  override def servicesPath: String = org.corespring.container.client.controllers.routes.Editor.services().url
}


