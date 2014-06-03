package org.corespring.container.client.component

import org.corespring.container.client.controllers.helpers.NameHelper
import org.corespring.container.client.views.txt.js.{ ComponentServerWrapper, ServerLibraryWrapper, ComponentWrapper }
import org.corespring.container.components.model._

class EditorGenerator extends SourceGenerator {

  override def css(components: Seq[Component]): String = {
    val (libraries, uiComps, layoutComps) = splitComponents(components)
    val uiCss = uiComps.map(_.client.css.getOrElse("")).mkString("\n")
    val layoutCss = layoutComps.map(_.css.getOrElse("")).mkString("\n")
    val libraryCss = libraries.map(_.css.getOrElse("")).mkString("\n")
    s"$uiCss\n$layoutCss\n$libraryCss"
  }

  override def js(components: Seq[Component]): String = {
    val (libs, uiComps, layoutComps) = splitComponents(components)
    val uiJs = uiComps.map(uiComponentToJs).mkString("\n")
    val libJs = libs.map(libraryToJs(true, true)).mkString("\n")
    val layoutJs = layoutComps.map(layoutToJs).mkString("\n")
    s"$libJs\n$uiJs\n$layoutJs"
  }

  private def header(c: Component, msg: String) = s"""
      // -----------------------------------------
      // ${c.id.org} ${c.id.name} | $msg
      // -----------------------------------------
  """

  protected def wrapEditorComponent(org: String, name: String, src: String, directive: Option[String] = None) = {
    val d = directive.getOrElse(directiveName(org, name))
    ComponentWrapper(moduleName(org, name), d, src).toString
  }

  private def wrapServerJs(componentType: String, definition: String): String = ComponentServerWrapper(componentType, definition).toString

  private def uiComponentToJs(ui: UiComponent): String = {
    val configJs = wrapEditorComponent(ui.org, ui.name, ui.client.configure, Some(s"${directiveName(ui.org, ui.name)}Config"))
    //Add the render directives as previews
    val previewJs = wrapEditorComponent(ui.org, ui.name, ui.client.render, Some(s"${directiveName(ui.org, ui.name)}"))
    val serverJs = wrapServerJs(tagName(ui.org, ui.name), ui.server.definition)

    s"""
          ${header(ui, "Client Config")}
          $configJs
          ${header(ui, "Client Preview")}
          $previewJs
          ${header(ui, "Server")}
          $serverJs
          """
  }
}

class CatalogGenerator extends SourceGenerator {

  override def css(components: Seq[Component]): String = {
    val (libraries, uiComps, layoutComps) = splitComponents(components)
    val uiCss = uiComps.map(_.client.css.getOrElse("")).mkString("\n")
    val layoutCss = layoutComps.map(_.css.getOrElse("")).mkString("\n")
    val libraryCss = libraries.map(_.css.getOrElse("")).mkString("\n")
    s"$uiCss\n$layoutCss\n$libraryCss"
  }

  override def js(components: Seq[Component]): String = {
    val (libs, uiComps, layoutComps) = splitComponents(components)
    val uiJs = uiComps.map(uiComponentToJs).mkString("\n")
    val libJs = libs.map(libraryToJs(true, true)).mkString("\n")
    val layoutJs = layoutComps.map(layoutToJs).mkString("\n")
    s"$libJs\n$uiJs\n$layoutJs"
  }

  private def header(c: Component, msg: String) = s"""
      // -----------------------------------------
      // ${c.id.org} ${c.id.name} | $msg
      // -----------------------------------------
  """

  protected def wrapEditorComponent(org: String, name: String, src: String, directive: Option[String] = None) = {
    val d = directive.getOrElse(directiveName(org, name))
    ComponentWrapper(moduleName(org, name), d, src).toString
  }

  private def wrapServerJs(componentType: String, definition: String): String = ComponentServerWrapper(componentType, definition).toString

  private def uiComponentToJs(ui: UiComponent): String = {
    val configJs = wrapEditorComponent(ui.org, ui.name, ui.client.configure, Some(s"${directiveName(ui.org, ui.name)}Config"))
    //Add the render directives as previews
    val previewJs = wrapEditorComponent(ui.org, ui.name, ui.client.render, Some(s"${directiveName(ui.org, ui.name)}"))
    val serverJs = wrapServerJs(tagName(ui.org, ui.name), ui.server.definition)

    s"""
          ${header(ui, "Client Config")}
          $configJs
          ${header(ui, "Client Preview")}
          $previewJs
          ${header(ui, "Server")}
          $serverJs
          """
  }
}

class PlayerGenerator extends SourceGenerator {

  override def css(components: Seq[Component]): String = {
    val (libraries, uiComps, layoutComps) = splitComponents(components)
    val uiCss = uiComps.map(_.client.css.getOrElse("")).mkString("\n")
    val layoutCss = layoutComps.map(_.css.getOrElse("")).mkString("\n")
    val libraryCss = libraries.map(_.css.getOrElse("")).mkString("\n")
    s"$uiCss\n$layoutCss\n$libraryCss"
  }

  override def js(components: Seq[Component]): String = {
    val (libs, uiComps, layoutComps) = splitComponents(components)
    val uiJs = uiComps.map(c => wrapComponent(c.org, c.name, c.client.render)).mkString("\n")
    val libJs = libs.map(libraryToJs(addClient = true, addServer = false)).mkString("\n")
    val layoutJs = layoutComps.map(layoutToJs).mkString("\n")
    s"$libJs\n$uiJs\n$layoutJs"
  }
}

trait SourceGenerator
  extends ComponentTypeFilter
  with NameHelper {

  def js(components: Seq[Component]): String

  def css(components: Seq[Component]): String

  protected def wrapComponent(org: String, name: String, src: String) = {
    ComponentWrapper(moduleName(org, name), directiveName(org, name), src).toString
  }

  protected def layoutToJs(layout: LayoutComponent): String = {
    layout.client.map(wrapClientLibraryJs(moduleName(layout.org, layout.name))).mkString("\n")
  }

  protected def libraryToJs(addClient: Boolean, addServer: Boolean)(l: Library): String = {

    def wrapServerLibraryJs(src: LibrarySource) = {
      s"""
      // ----------------- ${src.name} ---------------------
      ${ServerLibraryWrapper(src.name, src.source)}
      """
    }

    val libs = if (addClient) l.client.map(wrapClientLibraryJs(moduleName(l.org, l.name))).mkString("\n") else ""
    val server = if (addServer) l.server.map(wrapServerLibraryJs).mkString("\n") else ""

    s"""
    // -------------------- Libraries -----------------------
    $libs

    $server
    """
  }

  private def wrapClientLibraryJs(moduleName: String)(src: LibrarySource) = {
    s"""
      // ----------------- ${src.name} ---------------------
      ${ComponentWrapper(moduleName, src.name, src.source)}
      """
  }

  protected def splitComponents(comps: Seq[Component]): (Seq[Library], Seq[UiComponent], Seq[LayoutComponent]) = (
    filterByType[Library](comps),
    filterByType[UiComponent](comps),
    filterByType[LayoutComponent](comps))

}
