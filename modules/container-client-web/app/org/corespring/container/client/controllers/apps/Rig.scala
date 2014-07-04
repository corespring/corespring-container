package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.RigItemTypeReader
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.hooks.ClientHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model.Interaction
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.{ Action, RequestHeader }

import scala.concurrent.{ ExecutionContext, Future }

trait Rig extends AppWithConfig[ClientHooks] with RigItemTypeReader {

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

  def component(componentType: String): Option[Interaction] = interactions.find(c => c.componentType == componentType)

  def asset(componentType: String, file: String) = controllers.Assets.at("/container-client", file)

  override def context: String = "rig"

  override def additionalScripts: Seq[String] = Seq.empty

  override def hooks: ClientHooks = new ClientHooks {

    override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global

    def passThrough: Future[Either[StatusMessage, JsValue]] = Future(Right(Json.obj()))

    override def loadItem(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = passThrough
  }

  override def ngModules: AngularModules = new AngularModules()
}
