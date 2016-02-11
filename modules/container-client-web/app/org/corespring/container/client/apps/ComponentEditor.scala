package org.corespring.container.client.apps

import org.corespring.container.client.controllers.apps.{ ComponentEditorTemplateParams, CssSourcePaths, NgSourcePaths }
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.views.txt.js.ComponentEditorServices
import play.api.templates.Html

trait ComponentEditorRendering {
  def html: Html
}

// componentEditor(componentType:String) ==>
// val componentsRenderBundle : RenderBundle
// ComponentEditor(renderBundle)

trait AppViews {
  def componentEditor(): Html
}

case class ComponentEditor(componentType: String,
  appJs: NgSourcePaths,
  appCss: CssSourcePaths,
  jade: Jade) extends ComponentEditorRendering {

  lazy val params: ComponentEditorTemplateParams = {

    val options = ???
    ComponentEditorTemplateParams(
      "singleComponentEditor",
      appJs.src,
      appCss.src,
      Seq.empty,
      ComponentEditorServices("singleComponentEditor.services", Seq.empty, componentType).toString,
      obj(),
      options,
      previewMode = "tabs")
  }

  override def html: Html = jade.renderJade(params)
}
