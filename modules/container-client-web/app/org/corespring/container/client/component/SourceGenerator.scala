package org.corespring.container.client.component

import org.corespring.container.client.controllers.helpers.{ LoadClientSideDependencies, NameHelper }
import org.corespring.container.client.views.txt.js.{ ComponentServerWrapper, ComponentWrapper, ServerLibraryWrapper }
import org.corespring.container.components.model._
import org.corespring.container.components.model.dependencies.ComponentTypeFilter
import org.corespring.container.components.model.packaging.ClientSideDependency
import play.api.libs.json.JsObject
object SourceGenerator {
  object Keys {
    val LocalLibs = "local libs"
    val ThirdParty = "3rd party"
    val Libraries = "libraries"
    val Interactions = "Interactions"
    val Widgets = "Widgets"
    val Layout = "Layout"
  }
}

trait SourceGenerator
  extends ComponentTypeFilter
  with NameHelper {

  def js(components: Seq[Component]): String

  def css(components: Seq[Component]): String

  protected def wrapComponent(moduleName: String, directiveName: String, src: String) = {
    ComponentWrapper(moduleName, directiveName, src).toString
  }

  def layoutToJs(layout: LayoutComponent): String = {
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

trait ResourceLoading {
  def resource(path: String): Option[String]
}

trait LibrarySourceLoading {
  def loadLibrarySource(path: String): Option[String]
}

abstract class BaseGenerator
  extends SourceGenerator
  with LoadClientSideDependencies
  with ResourceLoading
  with LibrarySourceLoading
  with CodeMaker {

  protected def get3rdPartyScripts(dependencies: Seq[ClientSideDependency]): Seq[String] = {
    def loadSrc(name: String)(path: String): Option[String] = resource(s"$name/$path")
    val scripts = dependencies.map { d => d.files.map(loadSrc(d.name)) }.flatten
    scripts.flatten
  }

  protected def getLibScripts(components: Seq[Component]): Seq[String] = {

    def loadSrc(org: String, name: String, path: String): Option[String] = {
      val fullPath = s"$org/$name/libs/$path"
      loadLibrarySource(fullPath)
    }

    val libSrc = for {
      comp <- components
      lib <- (comp.packageInfo \ "libs").asOpt[JsObject]
      client <- (lib \ "client").asOpt[JsObject]
      paths <- Some(client.fields.map(_._2.as[Seq[String]]).flatten)
    } yield {
      for (p <- paths) yield loadSrc(comp.id.org, comp.id.name, p)
    }
    libSrc.flatten.flatten
  }

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

    val dependencies = getClientSideDependencies(components)
    val scripts = get3rdPartyScripts(dependencies).mkString("\n")
    val libScripts = getLibScripts(components).mkString("\n")

    import SourceGenerator.Keys._

    makeJs(
      LocalLibs -> libScripts,
      ThirdParty -> scripts,
      Libraries -> libJs,
      Interactions -> uiJs,
      Widgets -> widgetJs,
      Layout -> layoutJs)
  }

  protected def header(id: Id, msg: String) = s"""
      // -----------------------------------------
      // ${id.org} ${id.name} | $msg
      // -----------------------------------------
  """

  protected def wrapWithHeader(id: Id, js: String, msg: String) = {
    val m = moduleName(id.org, id.name)
    val d = directiveName(id.org, id.name)
    s"""
       | ${header(id, msg)}
       | ${wrapComponent(m, d, js)}
     """.stripMargin
  }

  private def previewJs(id: Id, js: String) = wrapWithHeader(id, js, "Client Preview")

  def widgetToJs(ui: Widget): String = previewJs(ui.id, ui.client.render)

  def interactionToJs(ui: Interaction): String = previewJs(ui.id, ui.client.render)
}

trait EditorGenerator extends BaseGenerator with DefaultCodeMaker {

  private def configJs(id: Id, js: String) = wrapJs(id, js, "Config", "Client Config")

  private def wrapJs(id: Id, js: String, suffix: String, msg: String) = {
    val m = moduleName(id.org, id.name)
    val d = s"${directiveName(id.org, id.name)}$suffix"

    s"""
       | ${header(id, msg)}
       | ${wrapComponent(m, d, js)}
     """.stripMargin
  }

  private def serverJs(componentType: String, definition: String): String = ComponentServerWrapper(componentType, definition).toString

  override def interactionToJs(i: Interaction): String = {
    val base = super.interactionToJs(i)
    val cfg = configJs(i.id, i.client.configure)
    val server = serverJs(i.componentType, i.server.definition)
    s"""
       |$base
       |$cfg
       |$server
     """.stripMargin
  }

  override def widgetToJs(w: Widget): String = {
    val base = super.widgetToJs(w)
    val cfg = configJs(w.id, w.client.configure)
    s"""
       |$base
       |$cfg
     """.stripMargin
  }

  override protected def libraryToJs(l: Library): String = addLibraryJs(true, true)(l)
}

trait CatalogGenerator extends BaseGenerator with DefaultCodeMaker {
  override protected def libraryToJs(l: Library): String = addLibraryJs(true, false)(l)
}

trait PlayerGenerator extends BaseGenerator with DefaultCodeMaker {
  override protected def libraryToJs(l: Library): String = addLibraryJs(true, false)(l)
}

