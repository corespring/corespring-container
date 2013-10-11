package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.views.txt.js.{ComponentWrapper, EditorServices}
import play.api.Logger
import play.api.mvc.{AnyContent, Action}
import play.api.libs.json.{JsArray, JsValue, Json}

trait EditorHooks extends BaseHooks {

  val log = Logger("editor.hooks")

  override def name = "editor"

  lazy val basePath = {
    val url = org.corespring.container.client.controllers.routes.Assets.item("..", "..").url
    val Split = """/(.*?)/.*""".r
    val Split(base) = url
    base
  }

  override def services(itemId: String): Action[AnyContent] = builder.loadServices(itemId){
    request: PlayerRequest[AnyContent] =>
      log.debug(s"load editor services: $itemId")
      import org.corespring.container.client.controllers.resources.routes._

      val componentJson : Seq[JsValue] = loadedComponents.map{ c =>
        val tag = tagName(c.org, c.name)
        Json.obj(
          "name" -> c.name,
          "icon" -> s"/$basePath/icon/$tag",
          "componentType" -> tag,
          "defaultData" -> c.defaultData
        )
      }

      Ok(EditorServices(ngModule, Item.load(itemId), Item.save(itemId), JsArray(componentJson))).as("text/javascript")
  }

  override def componentsJs(itemId:String) : Action[AnyContent] = builder.loadComponents(itemId) {
    request : PlayerRequest[AnyContent] =>
      componentsToResource(loadedComponents, (c) => {
        val configJs = wrapJs(c.org, c.name, c.client.configure, Some(s"${directiveName(c.org, c.name)}Config"))
        //Add the render directives as previews
        val previewJs = wrapJs(c.org, c.name, c.client.render, Some(s"${directiveName(c.org, c.name)}"))
        s"$configJs\n$previewJs"
      }, "text/javascript")
  }

  override def componentsCss(sessionId: String):  Action[AnyContent] = builder.loadComponents(sessionId) {
    request =>
      log.debug(s"load css for session $sessionId")
      componentsToResource(loadedComponents, _.client.css.getOrElse(""), "text/css")
  }

  override def wrapJs(org:String, name:String, src:String, directive: Option[String] = None) = {
    val d = directive.getOrElse(directiveName(org, name))
    ComponentWrapper(moduleName(org, name), d, src ).toString
  }

}
