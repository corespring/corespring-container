package org.corespring.container.client.controllers.helpers

import java.net.URLEncoder

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.views.txt.js.ComponentWrapper
import org.corespring.container.components.model.packaging.{ ClientDependencies, ClientSideDependency }
import org.corespring.container.components.model.{ Component, Interaction }
import org.corespring.container.utils.string
import play.api.libs.json._
import play.api.mvc.{ RequestHeader, Results, Result }

trait NameHelper {

  protected def moduleName(org: String, comp: String) = string.join(".", org, comp)

  protected def tagName(org: String, comp: String): String = string.join("-", org, comp)

  protected def directiveName(org: String, comp: String) = s"$org${string.hyphenatedToTitleCase(comp)}"
}

trait LoadClientSideDependencies {

  def getClientSideDependencies(comps: Seq[Component]): Seq[ClientSideDependency] = {
    val packages = comps.map(_.packageInfo)
    val dependencies = packages.flatMap(p => (p \ "dependencies").asOpt[JsObject])
    dependencies.map(ClientDependencies(_)).flatten
  }
}

trait Helpers extends NameHelper {

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
      "css" -> cssPaths)

  protected def componentsToResource(components: Seq[Interaction], componentToString: Interaction => String,
    contentType: String): Result = {
    Results.Ok(components.map(componentToString).mkString("\n")).as(contentType)
  }

  protected def wrapJs(org: String, name: String, src: String, directive: Option[String] = None) = {
    ComponentWrapper(moduleName(org, name), directiveName(org, name), src).toString
  }
}

trait JsonHelper {

  def partialObj(fields: (String, Option[JsValue])*): JsObject =
    JsObject(fields.filter { case (_, v) => v.nonEmpty }.map { case (a, b) => (a, b.get) })

}

trait QueryHelper {
  def removableQueryStringParams: Seq[String] = Seq()

  def mapToParamString(m: Map[String, String]): String = m.toSeq.map { t =>
    val (key, value) = t
    val encodedValue = URLEncoder.encode(value, "utf-8")
    s"$key=$encodedValue"
  }.mkString("&")

  def mapToJson(m: Map[String, String]): JsObject = {
    import play.api.libs.json._
    Json.toJson(m).asInstanceOf[JsObject]
  }

  def queryParams[A](build: (Map[String, String] => A) = mapToParamString _)(implicit rh: RequestHeader): A = {
    val trimmed = (rh.queryString -- removableQueryStringParams).mapValues(s => s.mkString(""))
    build(trimmed)
  }
}
