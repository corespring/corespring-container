package org.corespring.container.client.component

case class ComponentScriptInfo(context: String, jsUrl: Seq[String],
  cssUrl: Seq[String],
  ngDependencies: Seq[String])
