package org.corespring.container.client.pages.componentEditor

import org.corespring.container.client.pages.engine.Jade
import play.api.templates.Html

import scala.concurrent.Future

class ComponentEditorRenderer(jade: Jade) {

  def render: Future[Html] = Future {
    jade.renderJade("singleComponentEditor", Map.empty[String, Any])
  }
}
