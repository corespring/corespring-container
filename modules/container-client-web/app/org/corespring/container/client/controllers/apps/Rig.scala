package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.hooks.ClientHooks
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model.{ ComponentInfo, Interaction }
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.{ Action, RequestHeader }

import scala.concurrent.{ ExecutionContext, Future }

trait Rig extends AppWithConfig[ClientHooks] with PlayerItemTypeReader {

  def index(componentType: String, data: Option[String] = None) = controllers.Assets.at("/container-client", s"rig.html")

  def data(componentType: String, dataName: String) = Action {
    request =>
      Ok(loadData(componentType, dataName))
  }

  def loadData(componentType: String, dataName: String): JsValue = {
    val data = for {
      c <- component(componentType)
      filename <- Some(if (dataName.endsWith(".json")) dataName else s"$dataName.json")
      d <- c.sampleData.get(filename)
    } yield d
    data.getOrElse(Json.obj())
  }

  def component(componentType: String): Option[ComponentInfo] = (interactions ++ widgets).find(c => c.componentType == componentType)

  def asset(componentType: String, file: String) = controllers.Assets.at("/container-client", file)

  override def context: String = "rig"

  override def additionalScripts: Seq[String] = Seq.empty

  override def hooks: ClientHooks = new ClientHooks {

    override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global

    override def loadItem(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = Future {
      header.getQueryString("data").map { jsonFile =>
        Right((loadData(id, jsonFile) \ "item").as[JsValue])
      }.getOrElse(Left(BAD_REQUEST, "You need to specify a json file using 'data' query param"))
    }
  }

  override def ngModules: AngularModules = new AngularModules()
}
