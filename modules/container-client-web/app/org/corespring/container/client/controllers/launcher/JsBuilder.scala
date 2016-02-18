package org.corespring.container.client.controllers.launcher

import org.corespring.container.client.views.txt.js.ServerLibraryWrapper
import play.api.libs.json.{ JsObject, Json }
import play.api.templates.TxtFormat

private[launcher] class JsBuilder(corespringUrl: String, val load: String => Option[String]) extends JsResource {

  lazy val coreJs: String = {

    def lib(n: String) = s"container-client/js/player-launcher/$n.js"

    val corePaths = {
      Some("container-client/bower_components/msgr.js/dist/msgr.js") ++
        Seq("logger", "callback-utils", "error-codes", "instance", "client-launcher", "url-builder", "object-id", "draft-id").map(lib)
    }

    val rawJs = pathToNameAndContents("container-client/js/corespring/core-library.js")._2
    val wrapped = corePaths.map(pathToNameAndContents).map(t => ServerLibraryWrapper(t._1, t._2))
    val bootstrap =
      s"""
         |window.org = window.org || {};
         |org.corespring = org.corespring || {};
         |org.corespring.players = org.corespring.players || {};
      """.stripMargin
    s"""$bootstrap
        $rawJs
        ${wrapped.mkString("\n")}
      """
  }

  def buildJs(files: Seq[String], options: JsObject, bootstrapLine: String, queryParams: Map[String, String]): String = {

    val fullConfig = Json.obj(
      "corespringUrl" -> corespringUrl,
      "queryParams" -> queryParams) ++ options
    val fullConfigJs = ("launch-config" -> s"module.exports = ${Json.stringify(fullConfig)}")
    val wrappedNameAndContents = fullConfigJs +: additionalJsNameAndSrc
    val wrappedContents: Seq[TxtFormat.Appendable] = wrappedNameAndContents.map {
      case (name, content) => ServerLibraryWrapper(name, content)
    }

    s"""
       $coreJs
       ${wrappedContents.mkString("\n")}
       $bootstrapLine"""
  }
}