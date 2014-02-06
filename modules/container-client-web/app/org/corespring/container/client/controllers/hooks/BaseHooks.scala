package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.controllers.helpers.{XhtmlProcessor, Helpers}
import org.corespring.container.client.views.txt.js.{ServerLibraryWrapper, ComponentWrapper}
import org.corespring.container.components.model._
import org.corespring.container.components.model.packaging.{ClientSideDependency, ClientDependencies}
import play.api.libs.json.JsObject
import play.api.libs.json.JsValue
import play.api.mvc.Controller


trait BaseHooks extends Controller with Helpers with XhtmlProcessor {

  protected def name: String


  def componentCss = s"$name-components.css"

  def componentJs = s"$name-components.js"

  def loadedComponents: Seq[Component]

  def modulePath = v2Player.Routes.prefix

  private def filterByType[T](comps: Seq[Component])(implicit m: scala.reflect.Manifest[T]): Seq[T] = comps.filter(c => m.runtimeClass.isInstance(c)).map(_.asInstanceOf[T])


  def uiComponents: Seq[UiComponent] = filterByType[UiComponent](loadedComponents)

  def libraries: Seq[Library] = filterByType[Library](loadedComponents)

  def layoutComponents: Seq[LayoutComponent] = filterByType[LayoutComponent](loadedComponents)

  protected def configForTags(defaultNgModules: Seq[String], defaultScripts: Seq[String], xhtml: String, tagNames: String*) = {
    val usedComponents = getAllComponentsForTags(tagNames)
    val allModuleNames = usedComponents.map(c => idToModuleName(c.id))
    val clientSideDependencies = getClientSideDependencies(usedComponents)
    val dependencyModules: Seq[String] = clientSideDependencies.map(_.angularModule).flatten
    val clientSideScripts = get3rdPartyScripts(clientSideDependencies)
    val localScripts = getLocalScripts(usedComponents)
    val out: JsValue = configJson(
      xhtml,
      defaultNgModules ++ allModuleNames ++ dependencyModules,
      clientSideScripts ++ localScripts ++ defaultScripts ++ Seq(componentJs),
      Seq(componentCss)
    )
    Ok(out)
  }

  protected def getAllComponentsForTags(tags: Seq[String]): Seq[Component] = {

    def withinScope(id: LibraryId) = id.scope.map {
      s =>
        s == name
    }.getOrElse(true)

    def compMatchesTag(c: Component) = tags.exists(tag => tag == tagName(c.id.org, c.id.name))

    val uiComps = uiComponents.filter(compMatchesTag)
    val libraryIds = uiComps.map(_.libraries).flatten.distinct.filter(withinScope)
    val libs = libraries.filter(l => libraryIds.exists(used => l.id.matches(used)))
    val layoutComps = layoutComponents.filter(compMatchesTag)
    (libs ++ uiComps ++ layoutComps).distinct
  }

  protected def jsForComponents(types: Seq[String]) = {
    val usedComponents = getAllComponentsForTags(types)
    val (libs, uiComps, layoutComps) = splitComponents(usedComponents)
    val uiJs = uiComps.map((c) => wrapJs(c.org, c.name, c.client.render)).mkString("\n")
    val libJs = libs.map(libraryToJs(addClient = true, addServer = false)).mkString("\n")
    val layoutJs = layoutComps.map(layoutToJs).mkString("\n")
    Ok(s"$libJs\n$uiJs\n$layoutJs").as("text/javascript")
  }

  protected def splitComponents(comps: Seq[Component]): (Seq[Library], Seq[UiComponent], Seq[LayoutComponent]) =
    (
      filterByType[Library](comps),
      filterByType[UiComponent](comps),
      filterByType[LayoutComponent](comps)
      )


  private def getClientSideDependencies(comps: Seq[Component]): Seq[ClientSideDependency] = {
    val packages = comps.map(_.packageInfo)
    val deps = packages.flatMap(p => (p \ "dependencies").asOpt[JsObject])
    deps.map(ClientDependencies(_)).flatten
  }

  private def get3rdPartyScripts(deps: Seq[ClientSideDependency]): Seq[String] = {
    val scripts = deps.map {
      d =>
        d.files match {
          case Seq(p) => Some(s"$modulePath/components/${d.name}/${d.files(0)}")
          case _ => None
        }
    }.flatten
    scripts
  }


  private def getLocalScripts(comps: Seq[Component]): Seq[String] = {

    def assetPath(compAndPath: (Component, Seq[String]), acc: Seq[String]) = {
      val (c, filenames) = compAndPath
      acc ++ filenames.map(f => s"$modulePath/libs/${c.id.org}/${c.id.name}/$f")
    }

    val out = for {
      comp <- comps
      lib <- (comp.packageInfo \ "libs").asOpt[JsObject]
      client <- (lib \ "client").asOpt[JsObject]
    } yield (comp, client.fields.map(_._2.as[Seq[String]]).flatten)

    val assetPaths = out.foldRight[Seq[String]](Seq.empty)(assetPath)
    assetPaths
  }


  private def wrapClientLibraryJs(moduleName: String)(src: LibrarySource) = {
    s"""
      // ----------------- ${src.name} ---------------------
      ${ComponentWrapper(moduleName, src.name, src.source)}
      """
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


  protected def makeModuleName(componentType: String): String = {
    val Regex = """(.*?)-(.*)""".r
    val Regex(org, comp) = componentType
    moduleName(org, comp)
  }

  protected def idToModuleName(id: Id): String = moduleName(id.org, id.name)

}


