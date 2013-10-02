package org.corespring.container.controllers

object Assets {
  def at(id:String, path: String, file: String) = controllers.Assets.at(path, file)
}
