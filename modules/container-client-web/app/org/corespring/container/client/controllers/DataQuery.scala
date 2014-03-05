package org.corespring.container.client.controllers

import play.api.mvc.{ Action, AnyContent, Controller }

/** Query service for static data, eg: subject, gradelevel, etc */
trait DataQuery extends Controller {

  /** list all that match the query - if there's no query list all */
  def list(topic: String, query: Option[String] = None): Action[AnyContent]

  def findOne(topic: String, id: String): Action[AnyContent]

}
