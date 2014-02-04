package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.{PlayerRequest, ClientActions}
import play.api.mvc.{Action, AnyContent}
import play.api.libs.json.JsValue


trait BaseHooksWithActions[T <: ClientActions[AnyContent]] extends BaseHooks {

  def ngModule = s"$name.services"

  def ngJs = s"$name-services.js"

  def actions: T

  /**
   * Load the angular service js implemenation
   * @param id
   * @return
   */
  def services(id: String): Action[AnyContent]

  /**
   * Load the components js
   * @param id
   * @return
   */
  def componentsJs(id: String): Action[AnyContent]


  /**
   * Load the component css
   * @param id
   * @return
   */
  def componentsCss(id: String): Action[AnyContent]

  protected def componentTypes(json: JsValue): Seq[String]

  def resource(resource: String, suffix: String, id: String): Action[AnyContent] = {
    resource match {
      case ("config") => config(id)
      case ("services") => services(id)
      case ("components") => suffix match {
        case ("js") => componentsJs(id)
        case ("css") => componentsCss(id)
      }
      case _ => Action(NotFound(s"$resource, $suffix, $id"))
    }
  }

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

  def config(id: String): Action[AnyContent] = actions.loadConfig(id) {
    request: PlayerRequest[AnyContent] =>

    /** Preprocess the xml so that it'll work in all browsers
      * aka: convert tagNames -> attributes for ie 8 support
      * TODO: A layout component may have multiple elements
      * So we need a way to get all potential component names from
      * each component, not just assume its the top level.
      */
      val xhtml = (request.item \ "xhtml").asOpt[String].map {
        xhtml =>
          tagNamesToAttributes(xhtml).getOrElse {
            throw new RuntimeException(s"Error processing $id: xhtml: $xhtml")
          }
      }.getOrElse("<div><h1>New Item</h1></div>")

      val itemTagNames: Seq[String] = componentTypes(request.item)
      configForTags(Seq(ngModule), Seq(ngJs), xhtml, itemTagNames: _*)
  }
}
