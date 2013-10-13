package org.corespring.container.client.controllers

import play.api.mvc.{Action, Controller}
import org.corespring.container.components.model.Component
import org.corespring.container.client.controllers.helpers.Helpers
import org.corespring.container.client.views.txt.js.RigServices
import play.api.libs.json.Json

trait Rig extends Controller with Helpers {


  val rigServiceName = "rig.services"

  def components: Seq[Component]

  def index(orgName: String, compName: String, data: Option[String] = None) = {
    val params = data.map(d => s"?data=$data").getOrElse("")
    controllers.Assets.at("/container-client", s"rig.html")
  }

  def asset(orgName: String, compName: String, file: String) = controllers.Assets.at("/container-client", file)

  def component(orgName: String, compName: String): Option[Component] = components.find(c => c.org == orgName && c.name == compName)

  def config(orgName: String, compName: String) = Action {
    request =>
      component(orgName, compName).map {
        c =>
          val json = configJson("", Seq(s"$orgName.$compName"), Seq("components.js"), Seq("components.css"))
          Ok(json)
      }.getOrElse(NotFound(""))
  }

  def componentsJs(orgName: String, compName: String) = Action {
    request =>
      componentsToResource(component(orgName, compName).toSeq, (c) => wrapJs(c.org, c.name, c.client.render), "text/javascript")
  }

  def componentsCss(orgName: String, compName: String) = Action {
    request =>
      componentsToResource(component(orgName, compName).toSeq, _.client.css.getOrElse(""), "text/css")
  }

  def data(orgName: String, compName: String, dataName: String) = Action {
    request =>
      val data = for {
        c <- component(orgName, compName)
        d <- c.sampleData.get(s"$dataName.json")
      } yield d
    Ok(data.getOrElse(Json.obj()))
  }
}
