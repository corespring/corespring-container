package org.corespring.container.client.component

import org.corespring.container.client.controllers.helpers.NameHelper
import org.corespring.container.client.views.txt.js.{ ComponentServerWrapper, ServerLibraryWrapper, ComponentWrapper }
import org.corespring.container.components.model._
import org.corespring.container.components.model.dependencies.ComponentTypeFilter

trait SourceGenerator
  extends ComponentTypeFilter
  with NameHelper {

  def js(components: Seq[Component]): String

  def css(components: Seq[Component]): String

  protected def wrapComponent(moduleName:String,directiveName: String, src: String) = {
    ComponentWrapper(moduleName, directiveName, src).toString
  }

  protected def layoutToJs(layout: LayoutComponent): String = {
    layout.client.map(wrapClientLibraryJs(moduleName(layout.org, layout.name))).mkString("\n")
  }

  protected def libraryToJs(l: Library): String

  protected def addLibraryJs(addClient: Boolean, addServer: Boolean)(l: Library): String = {

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

  protected def splitComponents(comps: Seq[Component]): (Seq[Library], Seq[Interaction], Seq[LayoutComponent], Seq[Widget]) = (
    filterByType[Library](comps),
    filterByType[Interaction](comps),
    filterByType[LayoutComponent](comps),
    filterByType[Widget](comps))
}

abstract class BaseGenerator extends SourceGenerator{

  override def css(components: Seq[Component]): String = {
    val (libraries, uiComps, layoutComps, widgets) = splitComponents(components)
    val uiCss = uiComps.map(_.client.css.getOrElse("")).mkString("\n")
    val widgetCss = widgets.map(_.client.css.getOrElse("")).mkString("\n")
    val layoutCss = layoutComps.map(_.css.getOrElse("")).mkString("\n")
    val libraryCss = libraries.map(_.css.getOrElse("")).mkString("\n")
    s"""
    |$uiCss
    |$widgetCss
    |$layoutCss
    |$libraryCss
    """.stripMargin
  }

  override def js(components: Seq[Component]): String = {
    val (libs, uiComps, layoutComps, widgets) = splitComponents(components)
    val uiJs = uiComps.map(interactionToJs).mkString("\n")
    val widgetJs = widgets.map(widgetToJs).mkString("\n")
    val libJs = libs.map(libraryToJs).mkString("\n")
    val layoutJs = layoutComps.map(layoutToJs).mkString("\n")
    s"""
    |$libJs
    |$uiJs
    |$widgetJs
    |$layoutJs
    """.stripMargin
  }

  protected def header(id: Id, msg: String) = s"""
      // -----------------------------------------
      // ${id.org} ${id.name} | $msg
      // -----------------------------------------
  """

  protected def wrapWithHeader(id : Id, js : String, msg:String) =  {
    val m = moduleName(id.org, id.name)
    val d = directiveName(id.org, id.name)
    s"""
       | ${header(id, msg)}
       | ${wrapComponent(m, d, js)}
     """.stripMargin
  }

  private def previewJs(id : Id, js : String) = wrapWithHeader(id, js, "Client Preview")

  protected def widgetToJs(ui: Widget): String = previewJs(ui.id, ui.client.render)
  protected def interactionToJs(ui: Interaction): String = previewJs(ui.id, ui.client.render)
}

class EditorGenerator extends BaseGenerator {

  private def configJs(id : Id, js : String) = wrapJs(id, js, "Config", "Client Config")

  private def wrapJs(id : Id, js : String, suffix:String, msg:String) =  {
    val m = moduleName(id.org, id.name)
    val d = s"${directiveName(id.org, id.name)}$suffix"

    s"""
       | ${header(id, msg)}
       | ${wrapComponent(m, d, js)}
     """.stripMargin
  }

  private def serverJs(componentType: String, definition: String): String = ComponentServerWrapper(componentType, definition).toString

  override def interactionToJs(i:Interaction) : String = {
    val base = super.interactionToJs(i)
    val cfg = configJs(i.id, i.client.configure)
    val server = serverJs(i.componentType, i.server.definition)
    s"""
       |$base
       |$cfg
       |$server
     """.stripMargin
  }

  override def widgetToJs(w:Widget) : String = {
    val base = super.widgetToJs(w)
    val cfg = configJs(w.id, w.client.configure)
    s"""
       |$base
       |$cfg
     """.stripMargin
  }

  override protected def libraryToJs(l: Library): String = addLibraryJs(true, true)(l)
}

class CatalogGenerator extends BaseGenerator {
  override protected def libraryToJs(l: Library): String = addLibraryJs(true, false)(l)
}

class PlayerGenerator extends BaseGenerator {
  override protected def libraryToJs(l: Library): String = addLibraryJs(true, false)(l)
}


