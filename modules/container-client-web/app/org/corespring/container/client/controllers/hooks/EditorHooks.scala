package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.views.txt.js.{ComponentWrapper, EditorServices}
import org.corespring.container.components.model.Component
import play.api.Logger
import play.api.mvc.{AnyContent, Action}

trait EditorHooks extends BaseHooks {

  val log = Logger("editor.hooks")

  //TODO: just have name = "editor" ?
  override def names: AssetNames = new AssetNames {
    def namespace = "editor-web.services"

    def components = "editor-components.js"

    def services = "editor-services.js"
  }

  override def services(itemId: String): Action[AnyContent] = builder.loadServices(itemId){
    request: PlayerRequest[AnyContent] =>
      log.debug(s"load editor services: $itemId")
      import org.corespring.container.client.controllers.resources.routes._
      Ok(EditorServices(names.namespace, Item.load(itemId), Item.save(itemId))).as("text/javascript")
  }

  override def components(itemId:String) : Action[AnyContent] = builder.loadComponents(itemId) {
    request : PlayerRequest[AnyContent] =>
      val js = loadedComponents.map(c => wrapJs(c)).mkString("\n")
      Ok(js).as("text/javascript")
  }

  override def wrapJs(c: Component) =
    ComponentWrapper(moduleName(c.org, c.name), directiveName(c.org, c.name), c.client.configure)

}
