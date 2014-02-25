package org.corespring.container.client.controllers.apps

import org.corespring.container.client.actions.{ PlayerRequest, ClientActions }
import org.corespring.container.client.component.RigItemTypeReader
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.components.model.UiComponent
import play.api.libs.json.Json
import play.api.mvc.{ Action, Result, AnyContent }

trait Rig extends AppWithConfig[ClientActions[AnyContent]] with RigItemTypeReader {

  def index(componentType: String, data: Option[String] = None) = {
    controllers.Assets.at("/container-client", s"rig.html")
  }

  def data(componentType: String, dataName: String) = Action {
    request =>
      val data = for {
        c <- component(componentType)
        d <- c.sampleData.get(s"$dataName.json")
      } yield d
      Ok(data.getOrElse(Json.obj()))
  }

  def component(componentType: String): Option[UiComponent] = uiComponents.find(c => c.componentType == componentType)

  def asset(componentType: String, file: String) = controllers.Assets.at("/container-client", file)

  override def context: String = "rig"

  override def additionalScripts: Seq[String] = Seq.empty

  override def actions: ClientActions[AnyContent] = new ClientActions[AnyContent] {

    def passThrough(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = Action {
      request =>
        block(PlayerRequest(Json.obj(), request))
    }

    override def loadConfig(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = passThrough(block)

    override def loadServices(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = passThrough(block)

    override def loadComponents(id: String)(block: (PlayerRequest[AnyContent]) => Result): Action[AnyContent] = passThrough(block)
  }

  override def ngModules: AngularModules = new AngularModules()
}
