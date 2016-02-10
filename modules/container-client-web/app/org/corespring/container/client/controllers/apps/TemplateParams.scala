package org.corespring.container.client.controllers.apps

import org.corespring.container.client.controllers.resources.SingleComponent
import play.api.libs.json._

trait TemplateParams {
  def appName: String

  def js: Seq[String]

  def css: Seq[String]

  def componentNgModules: Seq[String]

  def ngServiceLogic: String

  def toJadeParams: Map[String, Object] = {
    Map(
      "appName" -> appName,
      "js" -> js.toArray,
      "css" -> css.toArray,
      "componentNgModules" -> s"${componentNgModules.map { m => s"'$m'" }.mkString(",")}",
      "ngServiceLogic" -> ngServiceLogic)
  }
}

case class CatalogTemplateParams(appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String],
  ngServiceLogic: String,
  staticPaths: JsValue) extends TemplateParams{
  override def toJadeParams = {
    super.toJadeParams ++ Map("staticPaths" -> staticPaths)
  }
}

case class EditorClientOptions(debounceInMillis:Long, staticPaths:JsObject) {
  def toJson = Json.format[EditorClientOptions].writes(this)
}

trait ComponentEditorOptions{
  def uploadUrl:Option[String]
  def uploadMethod:Option[String]
  def singleComponentKey:String = SingleComponent.Key
  def toJson:JsValue
}

case class PreviewRightComponentEditorOptions(
                                     showPreview:Option[Boolean],
                                     uploadUrl:Option[String],
                                     uploadMethod:Option[String])
  extends ComponentEditorOptions{
  override def toJson = Json.format[PreviewRightComponentEditorOptions].writes(this)

}

case class TabComponentEditorOptions(activePane : Option[String],
                                   showNavigation:Option[Boolean],
                                   uploadUrl:Option[String],
                                   uploadMethod:Option[String])
  extends ComponentEditorOptions{
  override def toJson = Json.format[TabComponentEditorOptions].writes(this)
}

object ComponentEditorOptions{
  def default = TabComponentEditorOptions(None, None, None, None)
}

case class ComponentEditorTemplateParams(appName:String,
                                         js : Seq[String],
                                         css: Seq[String],
                                         componentNgModules: Seq[String],
                                         ngServiceLogic:String,
                                         versionInfo:JsValue,
                                         options: ComponentEditorOptions,
                                         previewMode : String
                                        ) extends TemplateParams {
  override def toJadeParams = {
    val extras = Map( "versionInfo" -> versionInfo, "previewMode" -> previewMode, "options" -> Json.stringify(options.toJson))
    super.toJadeParams ++ extras
  }
}

case class EditorTemplateParams(appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String],
  ngServiceLogic: String,
  versionInfo: JsValue,
  options: EditorClientOptions) extends TemplateParams {
  override def toJadeParams = {
    super.toJadeParams ++ Map(
      "versionInfo" -> Json.stringify(versionInfo),
      "options" -> Json.stringify(options.toJson))
  }
}

case class DevEditorTemplateParams(appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String],
  ngServiceLogic: String) extends TemplateParams

case class RigTemplateParams(appName: String,
  js: Seq[String],
  css: Seq[String],
  componentNgModules: Seq[String],
  itemJson: String) extends TemplateParams {
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
  warnings: Seq[String] = Seq.empty) extends TemplateParams {
  override def toJadeParams = {
    super.toJadeParams ++ Map(
      "showControls" -> new java.lang.Boolean(showControls),
      "sessionJson" -> Json.stringify(sessionJson),
      "versionInfo" -> Json.stringify(versionInfo),
      "useNewRelicRum" -> new java.lang.Boolean(useNewRelicRum),
      "newRelicRumConfig" -> Json.stringify(newRelicRumConfig),
      "warnings" -> Json.stringify(JsArray(warnings.map(JsString(_)))))
  }
}
