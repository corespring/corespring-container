package org.corespring.container.client.controllers.helpers

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.views.txt.js.ComponentWrapper
import org.corespring.container.components.model.UiComponent
import org.corespring.container.utils.string
import play.api.libs.json.JsArray
import play.api.libs.json.JsString
import play.api.libs.json._
import play.api.mvc.{Results, Result}

trait NameHelper{

  protected def moduleName(org: String, comp: String) = string.join(".", org, comp)

  protected def tagName(org:String, comp:String) = string.join("-", org, comp)

  protected def directiveName(org: String, comp: String) = s"$org${string.hyphenatedToTitleCase(comp)}"
}

trait Helpers extends NameHelper{

  implicit def toSeqJsValue(s: Seq[String]): JsValue = JsArray(s.map(JsString(_)))

  implicit def toJsString(s: String): JsValue = JsString(s)

  implicit val versionInfoToJson : Writes[VersionInfo] = Json.writes[VersionInfo]

  def configJson(xhtml: String,
                 dependencies: Seq[String],
                 scriptPaths: Seq[String],
                 cssPaths: Seq[String]): JsValue =

    Json.obj(
      "xhtml" -> xhtml,
      "angular" -> Json.obj("dependencies" -> dependencies),
      "scripts" -> scriptPaths,
      "css" -> cssPaths,
      "versionInfo" -> Json.toJson(VersionInfo.make)
    )


  protected def componentsToResource(components: Seq[UiComponent], componentToString : UiComponent => String, contentType : String) : Result = {
    Results.Ok(components.map(componentToString).mkString("\n")).as(contentType)
  }

  protected def wrapJs(org: String, name: String, src: String, directive : Option[String] = None) = {
    ComponentWrapper(moduleName(org, name), directiveName(org, name), src).toString
  }

}

