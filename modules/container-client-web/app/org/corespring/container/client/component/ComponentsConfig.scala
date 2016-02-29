package org.corespring.container.client.component

case class ComponentsConfig(
  componentsPath: String,
  bowerComponentsPath: String,
  minify: Boolean,
  gzip: Boolean)
