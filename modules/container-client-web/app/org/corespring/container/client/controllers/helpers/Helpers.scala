package org.corespring.container.client.controllers.helpers

import play.api.libs.json.{JsValue, JsArray, JsString, Json}
import org.corespring.container.components.model.Component
import play.api.mvc.{Results, Result}
import org.corespring.container.client.views.txt.js.ComponentWrapper

trait Helpers {

  implicit def toSeqJsValue(s: Seq[String]): JsValue = JsArray(s.map(JsString(_)))

  implicit def toJsString(s: String): JsValue = JsString(s)

  def configJson(xhtml: String,
                 dependencies: Seq[String],
                 scriptPaths: Seq[String],
                 cssPaths: Seq[String]): JsValue =

    Json.obj(
      "xhtml" -> xhtml,
      "angular" -> Json.obj("dependencies" -> dependencies),
      "scripts" -> scriptPaths,
      "css" -> cssPaths
    )

  protected def componentsToResource(components: Seq[Component], componentToString : Component => String, contentType : String) : Result = {
    Results.Ok(components.map(componentToString).mkString("\n")).as(contentType)
  }

  protected def wrapJs(org: String, name: String, src: String, directive : Option[String] = None) = {
    ComponentWrapper(moduleName(org, name), directiveName(org, name), src).toString
  }

  protected def moduleName(org: String, comp: String) = s"$org.$comp"

  protected def tagName(org:String, comp:String) = s"$org-$comp"

  protected def directiveName(org: String, comp: String) = s"$org${hyphenatedToTitleCase(comp)}"

  private def hyphenatedToTitleCase(s: String): String = s.split("-").map(_.capitalize).mkString("")
}
