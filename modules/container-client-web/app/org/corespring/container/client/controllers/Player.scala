package org.corespring.container.client.controllers

import org.corespring.container.client.component._

trait Player extends PlayerItemTypeReader with App{
  override def context: String = "player"
}


