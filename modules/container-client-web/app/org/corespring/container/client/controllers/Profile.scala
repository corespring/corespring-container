package org.corespring.container.client.controllers

import play.api.mvc.{ Action, AnyContent, Controller }

trait Profile extends Controller {

  def list(topic: String, query: Option[String] = None): Action[AnyContent]

  def findOne(topic: String, id: String): Action[AnyContent]

}
