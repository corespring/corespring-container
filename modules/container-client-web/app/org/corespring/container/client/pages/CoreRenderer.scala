package org.corespring.container.client.pages

import org.corespring.container.client.controllers.apps.PageSourceService

trait CoreRenderer {
  def pageSourceService: PageSourceService
  def name: String
  lazy val sources = Sources(name, pageSourceService)

  def jsArrayString(s: Iterable[String]) = s.map { s => s"'$s'" }.mkString(",")
}
