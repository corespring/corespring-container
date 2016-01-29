package org.corespring.container.client.controllers.launcher

import org.corespring.container.client.hooks.PlayerJs
import org.corespring.container.client.views.txt.js.ServerLibraryWrapper
import play.api.libs.json.{ Json, JsString, JsObject }
import play.api.mvc.{ AnyContent, Request, RequestHeader }
import play.api.templates.TxtFormat

class JsBuilder(corespringUrl: String) {

  import JsResource._

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

  private def queryStringToJson(implicit rh: RequestHeader) = Json.toJson(rh.queryString.mapValues(_.mkString))

  def buildJs(additionalJsNameAndSrc: Seq[(String, String)], options: JsObject, bootstrapLine: String): String = {
    val fullConfig = Json.obj(
      "corespringUrl" -> corespringUrl,
      "queryParams" -> queryStringToJson) ++ options
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

  def build(additionalJsNameAndSrc: Seq[(String, String)], options: JsObject, bootstrapLine: String)(implicit request: RequestHeader, js: PlayerJs): String = {
    val errorsAndWarnings = Json.obj("errors" -> js.errors, "warnings" -> js.warnings)
    buildJs(additionalJsNameAndSrc, options.deepMerge(errorsAndWarnings), bootstrapLine)
  }

  def build(additionalJsNameAndSrc: (String, String), options: JsObject, bootstrapLine: String)(implicit request: RequestHeader, js: PlayerJs): String = {
    buildJs(Seq(additionalJsNameAndSrc), options, bootstrapLine)
  }
}