package org.corespring.container.client.controllers.apps

import play.api.libs.json.{JsValue, Json}

sealed abstract class TemplateParams(
                                      js:Seq[String],
                                      css:Seq[String],
                                      componentNgModules: Seq[String]){
  def toJadeParams : Map[String,Object] = {
    Map(
      "js" -> js.toArray,
      "css"-> css.toArray,
      "componentNgModules" -> s"${componentNgModules.map{m => s"'$m'"}.mkString(",")}"
    )
  }
}

case class EditorTemplateParams(
                                 js:Seq[String],
                                 css:Seq[String],
                                 componentNgModules: Seq[String])
  extends TemplateParams(js, css, componentNgModules)

case class PlayerTemplateParams(
                                 js:Seq[String],
                                 css:Seq[String],
                                 componentNgModules: Seq[String],
                                 showControls:Boolean,
                                 html:String,
                                 sessionJson:JsValue,
                                 versionInfo:JsValue) extends TemplateParams(js, css, componentNgModules) {
  override def toJadeParams = {
    super.toJadeParams ++ Map(
      "html" -> html,
      "showControls" -> new java.lang.Boolean(showControls),
      "sessionJson" -> Json.stringify(sessionJson),
      "versionInfo" -> Json.stringify(versionInfo)
    )
  }
}
