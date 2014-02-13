package org.corespring.container.client.controllers

import org.corespring.container.client.component.AllItemTypesReader

trait Editor extends AllItemTypesReader with App{
  override def context: String = "editor"
}


