package org.corespring.container.client.controllers.launcher

import org.corespring.container.client.views.txt.js.ServerLibraryWrapper
import play.api.libs.json.{JsObject, Json}
import play.api.templates.TxtFormat

private[launcher] class JsBuilder(corespringUrl: String, val load : String => Option[String]) extends JsResource{

  lazy val coreJs: String = {
    val corePaths = Seq(
      "container-client/bower_components/msgr.js/dist/msgr.js",
      "container-client/js/player-launcher/logger.js",
      "container-client/js/player-launcher/error-codes.js",
      "container-client/js/player-launcher/instance.js",
      "container-client/js/player-launcher/client-launcher.js",
      "container-client/js/player-launcher/url-builder.js",
      "container-client/js/player-launcher/object-id.js")
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

  def buildJs(additionalJsNameAndSrc: Seq[(String, String)], options: JsObject, bootstrapLine: String, queryParams: Map[String,String]): String = {
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