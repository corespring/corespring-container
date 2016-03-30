package org.corespring.container.client.component

import play.api.{ Configuration, Mode }
import play.api.Mode.Mode

case class ComponentsConfig(
  componentsPath: String = "components",
  bowerComponentsPath: String = "container-client/bower_components",
  minify: Boolean,
  gzip: Boolean)

object ComponentsConfig {
  def fromConfig(mode: Mode, c: Configuration): ComponentsConfig = {
    val componentsPath: String = c.getString("path").getOrElse("components")
    val minify = c.getBoolean("minify").getOrElse(mode == Mode.Prod)
    val gzip = c.getBoolean("gzip").getOrElse(mode == Mode.Prod)
    ComponentsConfig(componentsPath, minify = minify, gzip = gzip)
  }
}
