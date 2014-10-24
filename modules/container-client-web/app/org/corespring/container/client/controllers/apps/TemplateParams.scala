package org.corespring.container.client.controllers.apps

import play.api.libs.json.{ JsValue, Json }

trait TemplateParams {
  def appName: String

  def js: Seq[String]

  def css: Seq[String]

  def componentNgModules: Seq[String]

  def toJadeParams: Map[String, Object] = {
    Map(
      "appName" -> appName,
      "js" -> js.toArray,
      "css" -> css.toArray,
      "componentNgModules" -> s"${componentNgModules.map { m => s"'$m'" }.mkString(",")}")
  }
}

case class CatalogTemplateParams(appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String]) extends TemplateParams

case class EditorTemplateParams(appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String]) extends TemplateParams

case class PlayerTemplateParams(
  appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String],
  showControls: Boolean,
  sessionJson: JsValue,
  versionInfo: JsValue) extends TemplateParams {
  override def toJadeParams = {
    super.toJadeParams ++ Map(
      "showControls" -> new java.lang.Boolean(showControls),
      "sessionJson" -> Json.stringify(sessionJson),
      "versionInfo" -> Json.stringify(versionInfo))
  }
}
