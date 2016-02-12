package org.corespring.container.client.pages

import play.api.templates.Html

import scala.concurrent.Future

trait Pages {

  def componentEditor: Future[Html]
}