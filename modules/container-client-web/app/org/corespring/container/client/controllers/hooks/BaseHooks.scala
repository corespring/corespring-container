package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.ClientHooksActionBuilder
import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.views.txt.js.{LibraryWrapper, ComponentWrapper}
import org.corespring.container.components.model.{LibrarySource, Library, UiComponent, Component}
import play.api.libs.json.{Json, JsValue}
import play.api.mvc.{Result, Controller, Action, AnyContent}
import org.corespring.container.client.controllers.helpers.Helpers

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

      val itemComponentTypes: Seq[String] = componentTypes(request.item)
      val moduleNames = itemComponentTypes.map(makeModuleName)
      val out: JsValue = configJson(
         xhtml,
        Seq(ngModule) ++ moduleNames,
        Seq(ngJs, componentJs),
        Seq(componentCss)
      )
      Ok(out)
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

  protected def libraryToJs(l:Library, addServer:Boolean = false) : String = {

    def wrapLibraryJs(src:LibrarySource) = {
      s"""
      // ----------------- ${src.name} ---------------------
      ${LibraryWrapper(src.name, src.source)}
      """
    }

    val libs = l.client.map( wrapLibraryJs ).mkString("\n")
    val server = if(addServer) l.server.map(wrapLibraryJs).mkString("\n") else ""
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



  protected def componentTypes(json: JsValue): Seq[String] = (json \ "components" \\ "componentType").map(_.as[String]).distinct

  protected def makeModuleName(componentType: String): String = {
    val Regex = """(.*?)-(.*)""".r
    val Regex(org, comp) = componentType
    moduleName(org, comp)
  }

}
