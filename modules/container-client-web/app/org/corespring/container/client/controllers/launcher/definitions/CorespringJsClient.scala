package org.corespring.container.client.controllers.launcher.definitions

import org.corespring.container.client.controllers.launcher.JsBuilder
import play.api.http.ContentTypes
import play.api.libs.json.JsObject
import play.api.mvc.SimpleResult

trait CorespringJsClient {

  def builder: JsBuilder
  def fileNames: Seq[String]
  def bootstrap: String
  def options: JsObject
  def queryParams: Map[String, String]

  def src(corespringUrl: String) = {
    builder.buildJs(corespringUrl, fileNames, options, bootstrap, queryParams)
  }

  def result(corespringUrl: String): SimpleResult = {
    import play.api.mvc.Results.Ok
    Ok(src(corespringUrl)).as(ContentTypes.JAVASCRIPT)
  }
}
