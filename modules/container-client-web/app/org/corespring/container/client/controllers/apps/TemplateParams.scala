package org.corespring.container.client.controllers.apps

import play.api.libs.json.{ JsValue, Json }

trait TemplateParams {
  def appName: String

  def js: Seq[String]

  def css: Seq[String]

  def less: Seq[String]

  def componentNgModules: Seq[String]

  def ngServiceLogic: String

  def toJadeParams: Map[String, Object] = {
    Map(
      "appName" -> appName,
      "js" -> js.toArray,
      "css" -> css.toArray,
      "less" -> less.toArray,
      "componentNgModules" -> s"${componentNgModules.map { m => s"'$m'" }.mkString(",")}",
      "ngServiceLogic" -> ngServiceLogic)
  }
}

case class CatalogTemplateParams(appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String],
  ngServiceLogic: String,
  staticPaths: JsValue, less: Seq[String] = Seq()) extends TemplateParams {
  override def toJadeParams = {
    super.toJadeParams ++ Map("staticPaths" -> staticPaths)
  }
}

case class EditorTemplateParams(appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String],
  ngServiceLogic: String,
  versionInfo: JsValue,
  staticPaths: JsValue, less: Seq[String] = Seq()) extends TemplateParams {
  override def toJadeParams = {
    super.toJadeParams ++ Map(
      "versionInfo" -> Json.stringify(versionInfo),
      "staticPaths" -> staticPaths)
  }
}

case class DevEditorTemplateParams(appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String],
  ngServiceLogic: String, less: Seq[String] = Seq()) extends TemplateParams

case class RigTemplateParams(appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String],
  itemJson: String, less: Seq[String] = Seq()) extends TemplateParams {
  override def ngServiceLogic: String = ""
  override def toJadeParams = {
    super.toJadeParams ++ Map(
      "itemJson" -> itemJson)
  }
}

case class PlayerTemplateParams(
  appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String],
  ngServiceLogic: String,
  showControls: Boolean,
  sessionJson: JsValue,
  versionInfo: JsValue,
  useNewRelicRum: Boolean,
  newRelicRumConfig: JsValue,
  less: Seq[String],
  colors: JsValue) extends TemplateParams {
  override def toJadeParams = {
    super.toJadeParams ++ Map(
      "showControls" -> new java.lang.Boolean(showControls),
      "sessionJson" -> Json.stringify(sessionJson),
      "versionInfo" -> Json.stringify(versionInfo),
      "useNewRelicRum" -> new java.lang.Boolean(useNewRelicRum),
      "newRelicRumConfig" -> Json.stringify(newRelicRumConfig),
      "colors" -> Json.stringify(colors))
  }
}
