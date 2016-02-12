package org.corespring.container.client.pages.componentEditor

import play.api.templates.Html


trait Render{

  def render : Html
}

class JadeRender extends Render{

  override def render: Html =
}