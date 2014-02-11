package org.corespring.container.client.controllers.hooks

import controllers.Assets
import org.corespring.container.client.actions.{EditorActions, PlayerRequest}
import org.corespring.container.client.views.txt.js.{ComponentServerWrapper, ComponentWrapper, EditorServices}
import org.corespring.container.components.model.{UiComponent, Component}
import play.api.Logger
import play.api.http.ContentTypes
import play.api.libs.json.{JsArray, JsValue, Json}
import play.api.mvc.{AnyContent, Action}
import scala.concurrent.{ExecutionContext, Future}

trait EditorHooks extends BaseHooksWithActions[EditorActions[AnyContent]] {

  val logger = Logger("editor.hooks")

  override def name = "editor"

  lazy val basePath = v2Player.Routes.prefix

  override protected def componentTypes(json: JsValue): Seq[String] = {
    loadedComponents.map {
      c => tagName(c.id.org, c.id.name)
    }
  }

  def editItem(itemId: String) = actions.editItem(itemId) {
    (code, msg) =>
      import ExecutionContext.Implicits.global
      Future(Status(code)(org.corespring.container.client.views.html.error.main(code, msg)))
  } {
    request =>
      logger.trace(s"[editItem]: $itemId")
      Assets.at("/container-client", "editor.html")(request)
  }

  def createItem = Action(BadRequest("This route is not implemented yet.. instead see: Item.create()"))
  /*actions.createItem {
    request: PlayerRequest[AnyContent] =>
      val itemId = (request.item \ "_id" \ "$oid").as[String]
      val url = org.corespring.container.client.controllers.routes.Assets.item(itemId, "editor.html").url
      SeeOther(url)
  }*/

  override def services(itemId: String): Action[AnyContent] = actions.loadServices(itemId) {
    request: PlayerRequest[AnyContent] =>
      logger.debug(s"load editor services: $itemId")
      import org.corespring.container.client.controllers.resources.routes._

      val componentJson: Seq[JsValue] = uiComponents.map {
        c =>
          val tag = tagName(c.id.org, c.id.name)
          Json.obj(
            "name" -> c.id.name,
            "icon" -> s"$basePath/icon/$tag",
            "componentType" -> tag,
            "defaultData" -> c.defaultData
          )
      }

      Ok(EditorServices(ngModule, Item.load(itemId), Item.save(itemId), JsArray(componentJson))).as("text/javascript")
  }


  private def uiComponentToJs(ui: UiComponent): String = {
    val configJs = wrapJs(ui.org, ui.name, ui.client.configure, Some(s"${directiveName(ui.org, ui.name)}Config"))
    //Add the render directives as previews
    val previewJs = wrapJs(ui.org, ui.name, ui.client.render, Some(s"${directiveName(ui.org, ui.name)}"))
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


  override def componentsJs(itemId: String): Action[AnyContent] = actions.loadComponents(itemId) {
    request: PlayerRequest[AnyContent] =>
      val uiJs = uiComponents.map(uiComponentToJs).mkString("\n")
      val libJs = libraries.map(libraryToJs(true, true)).mkString("\n")
      val layoutJs = layoutComponents.map(layoutToJs).mkString("\n")
      Ok(s"$libJs\n$uiJs\n$layoutJs").as("text/javascript")
  }

  private def header(c: Component, msg: String) = s"""
      // -----------------------------------------
      // ${c.id.org} ${c.id.name} | $msg
      // -----------------------------------------
  """

  override def componentsCss(sessionId: String): Action[AnyContent] = actions.loadComponents(sessionId) {
    request =>
      logger.debug(s"load css for session $sessionId")
      val uiCss = uiComponents.map(_.client.css.getOrElse("")).mkString("\n")
      val layoutCss = layoutComponents.map(_.css.getOrElse("")).mkString("\n")
      Ok(s"$uiCss\n$layoutCss").as(ContentTypes.CSS)
  }

  override def wrapJs(org: String, name: String, src: String, directive: Option[String] = None) = {
    val d = directive.getOrElse(directiveName(org, name))
    ComponentWrapper(moduleName(org, name), d, src).toString
  }

  private def wrapServerJs(componentType: String, definition: String): String = ComponentServerWrapper(componentType, definition).toString


}
