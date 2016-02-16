package org.corespring.container.client.controllers.apps

import play.api.libs.json.JsValue

trait SourcePaths {
  def src: Seq[String]

  def dest: String

  def otherLibs: Seq[String]
}

case class CssSourcePaths(src: Seq[String], dest: String, otherLibs: Seq[String]) extends SourcePaths

case class NgSourcePaths(src: Seq[String], dest: String, otherLibs: Seq[String], ngModules: Seq[String]) extends SourcePaths

object SourcePaths {

  def prefixModule(prefix: String)(p: String) = if (p.startsWith("//")) p else s"$prefix$p"

  def apply(prefix: String, json: JsValue): Option[SourcePaths] = {
    val src = (json \ "src").as[Seq[String]].map(prefixModule(prefix))
    val dest = s"$prefix${(json \ "dest").as[String]}"
    val otherLibs = (json \ "libs").as[Seq[String]].map(prefixModule(prefix))

    (json \ "ngModules").asOpt[Seq[String]].map { ngModules =>
      NgSourcePaths(src, dest, otherLibs, ngModules)
    }.orElse(
      Some(CssSourcePaths(src, dest, otherLibs)))
  }

  def js(prefix: String, json: JsValue): Option[NgSourcePaths] = apply(prefix, json).flatMap {
    case js: NgSourcePaths => Some(js)
    case _ => None
  }

  def css(prefix: String, json: JsValue): Option[CssSourcePaths] = apply(prefix, json).flatMap {
    case css: CssSourcePaths => Some(css)
    case _ => None
  }
}
