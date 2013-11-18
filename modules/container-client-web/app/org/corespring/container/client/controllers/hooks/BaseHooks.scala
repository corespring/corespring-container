package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.ClientHooksActionBuilder
import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.controllers.helpers.Helpers
import org.corespring.container.client.views.txt.js.{ServerLibraryWrapper, ComponentWrapper}
import org.corespring.container.components.model._
import org.corespring.container.components.model.packaging.{ClientSideDependency, ClientDependencies}
import play.api.libs.json.JsObject
import play.api.libs.json.JsValue
import play.api.mvc.{Controller, Action, AnyContent}

trait BaseHooks[T <: ClientHooksActionBuilder[AnyContent]] extends Controller with Helpers{

  protected def name : String

  def ngModule = s"$name.services"

  def ngJs = s"$name-services.js"

  def componentCss = s"$name-components.css"

  def componentJs = s"$name-components.js"

  def loadedComponents: Seq[Component]

  def uiComponents : Seq[UiComponent] = loadedComponents.filter( c => c.isInstanceOf[UiComponent]).map(_.asInstanceOf[UiComponent])
  def libraries : Seq[Library] = loadedComponents.filter( c => c.isInstanceOf[Library]).map(_.asInstanceOf[Library])

  def builder : T

    /**
     * TODO: The hooks service 4 requests:
     * - config.json
     * - services.js
     * - components.js
     * - components.css
     *
     * However we currently load the db resource each time.
     * Instead we should load it once and build the resources and serve them.
     */

  def config(id: String): Action[AnyContent] = builder.loadConfig(id) {
    request: PlayerRequest[AnyContent] =>
      val xhtml = (request.item \ "xhtml").asOpt[String].getOrElse("<div><h1>New Item</h1></div>")

      val itemTagNames: Seq[String] = componentTypes(request.item)
      val usedComponents = getAllComponentsForTags(itemTagNames)
      val allModuleNames = usedComponents.map(c => idToModuleName(c.id))
      val clientSideDependencies = getClientSideDependencies(usedComponents)
      val dependencyModules : Seq[String] = clientSideDependencies.map(_.angularModule).flatten
      val clientSideScripts = get3rdPartyScripts(clientSideDependencies)
      val localScripts = getLocalScripts(usedComponents)
      val out: JsValue = configJson(
         xhtml,
        Seq(ngModule) ++ allModuleNames ++ dependencyModules,
        clientSideScripts ++ localScripts ++ Seq(ngJs, componentJs),
        Seq(componentCss)
      )
      Ok(out)
  }

  protected def getAllComponentsForTags(tags:Seq[String]) : Seq[Component] = {

    def withinScope(id:LibraryId) = id.scope.map{ s =>
      s == name
    }.getOrElse(true)

    val uiComps = uiComponents.filter(c => tags.exists( tag => tag == tagName(c.id.org, c.id.name)))
    val libraryIds = uiComps.map(_.libraries).flatten.distinct.filter(withinScope)
    val libs = libraries.filter( l => libraryIds.exists( used => l.id.matches(used) ))
    (libs ++ uiComps).distinct
  }

  protected def splitComponents(comps:Seq[Component]) : (Seq[Library], Seq[UiComponent]) =
    (
      comps.filter(_.isInstanceOf[Library]).map(_.asInstanceOf[Library]),
      comps.filter(_.isInstanceOf[UiComponent]).map(_.asInstanceOf[UiComponent])
    )


  private def getClientSideDependencies(comps:Seq[Component]) : Seq[ClientSideDependency] = {
    val packages = comps.map(_.packageInfo)
    val deps = packages.flatMap( p => (p \ "dependencies").asOpt[JsObject] )
    deps.map( ClientDependencies(_)).flatten
  }
  
  private def get3rdPartyScripts(deps:Seq[ClientSideDependency]) : Seq[String] = {
    val scripts = deps.map{ d =>
      d.files match {
        case Seq(p) => Some(s"/client/components/${d.name}/${d.files(0)}")
        case _ => None
      }
    }.flatten
    scripts
  }


  private def getLocalScripts(comps: Seq[Component]): Seq[String] = {

    def assetPath(compAndPath: (Component, Seq[String]), acc : Seq[String]) = {
      val (c, filenames) = compAndPath
      acc ++ filenames.map(f => s"/client/libs/${c.id.org}/${c.id.name}/$f" )
    }

    val out = for{
      comp <- comps
      lib <- (comp.packageInfo \ "libs").asOpt[JsObject]
      client <- (lib \ "client").asOpt[JsObject]
    } yield (comp, client.fields.map(_._2.as[Seq[String]]).flatten)

    val assetPaths = out.foldRight[Seq[String]](Seq.empty)(assetPath)
    assetPaths
  }


  /**
   * Load the angular service js implemenation
   * @param id
   * @return
   */
  def services(id:String) : Action[AnyContent]

  /**
   * Load the components js
   * @param id
   * @return
   */
  def componentsJs(id:String) : Action[AnyContent]

  def resource(resource:String,suffix:String, id:String) : Action[AnyContent] = {
    resource match {
      case ("config") => config(id)
      case("services") => services(id)
      case ("components") => suffix match {
        case ("js") => componentsJs(id)
        case ("css") => componentsCss(id)
      }
      case _ => Action(NotFound(s"$resource, $suffix, $id"))
    }
  }

  protected def libraryToJs(addClient:Boolean, addServer:Boolean)(l:Library) : String = {

    def wrapServerLibraryJs(src:LibrarySource) = {
      s"""
      // ----------------- ${src.name} ---------------------
      ${ServerLibraryWrapper(src.name, src.source)}
      """
    }

    def wrapClientLibraryJs(src:LibrarySource) = {
      s"""
      // ----------------- ${src.name} ---------------------
      ${ComponentWrapper( moduleName(l.org, l.name), src.name, src.source)}
      """
    }

    val libs = if(addClient) l.client.map( wrapClientLibraryJs ).mkString("\n") else ""
    val server = if(addServer) l.server.map(wrapServerLibraryJs).mkString("\n") else ""

    s"""
    // -------------------- Libraries -----------------------
    $libs

    $server
    """
  }

  /**
   * Load the component css
   * @param id
   * @return
   */
  def componentsCss(id:String) : Action[AnyContent]

  protected def componentTypes(json: JsValue): Seq[String]

  protected def makeModuleName(componentType: String): String = {
    val Regex = """(.*?)-(.*)""".r
    val Regex(org, comp) = componentType
    moduleName(org, comp)
  }

  protected def idToModuleName(id:Id) : String = moduleName(id.org, id.name)

}
