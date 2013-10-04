package org.corespring.container.client.controllers

object Assets {
  def at(id:String, path: String, file: String) = controllers.Assets.at(path, file)
}
