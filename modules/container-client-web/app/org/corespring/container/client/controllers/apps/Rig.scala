package org.corespring.container.client.controllers.apps

import org.corespring.container.client.controllers.jade.Jade

import scala.concurrent.{ ExecutionContext, Future }

import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.hooks.{ LoadResponse, LoadHook }
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model.ComponentInfo
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.{ Action, AnyContent, RequestHeader }

trait Rig
  extends App[LoadHook]
  with PlayerItemTypeReader
  with Jade {

  def index(componentType: String, data: Option[String] = None) = controllers.Assets.at("/container-client", "rig.html")

  private def loadData(componentType: String, dataName: String): JsValue = {
    val data = for {
      c <- component(componentType)
      filename <- Some(if (dataName.endsWith(".json")) dataName else s"$dataName.json")
      d <- c.sampleData.get(filename)
    } yield d
    data.getOrElse(Json.obj())
  }

  private def component(componentType: String): Option[ComponentInfo] = (interactions ++ widgets).find(c => c.componentType == componentType)

  def asset(componentType: String, file: String) = controllers.Assets.at("/container-client", file)

  override def context: String = "rig"

  override def hooks: LoadHook = new LoadHook {

    override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global

    override def load(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, LoadResponse]] = Future {
      val componentType = id
      header.getQueryString("data").map { jsonFile =>
        Right(LoadResponse((loadData(componentType, jsonFile) \ "item").as[JsValue], Json.obj()))
      }.getOrElse(Left(BAD_REQUEST, "You need to specify a json file using 'data' query param"))
    }
  }

  override def ngModules: AngularModules = new AngularModules()

  def load(componentType: String): Action[AnyContent] = Action.async { implicit request =>

    def onError(sm: StatusMessage) = BadRequest(s"Rig error: ${sm._2}")

    def onItem(i: LoadResponse) = {
      val comps = (componentTypes(i.item) :+ componentType).distinct
      val scriptInfo = componentScriptInfo(comps, jsMode == "dev")
      val js = buildJs(scriptInfo)
      val css = buildCss(scriptInfo)
      val less = buildLess(scriptInfo)
      val itemJson = Json.prettyPrint(i.item)

      Ok(renderJade(
        RigTemplateParams(
          context,
          js,
          css,
          less,
          jsSrc.ngModules ++ scriptInfo.ngDependencies,
          itemJson)))
    }

    hooks.load(componentType).map { e => e.fold(onError, onItem) }
  }

}
