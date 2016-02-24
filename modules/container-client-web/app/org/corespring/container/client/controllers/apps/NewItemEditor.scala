package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.ComponentBundler
import org.corespring.container.client.hooks.EditorHooks
import org.corespring.container.client.pages.engine.EditorRenderer
import play.api.Mode
import play.api.Mode.Mode
import play.api.Mode.Mode
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future

class NewItemEditor(mode : Mode,
                   hooks:EditorHooks,
                   bundler :ComponentBundler,
                   renderer: EditorRenderer) extends Controller {


  val debounceInMillis: Long = 5000

  def load(id: String) = Action.async { implicit request =>
    hooks.load(id).flatMap { e => e match {
      case Left(_) => Future.successful(BadRequest("?"))
      case Right(json) => {


        val prodMode : Boolean = request.getQueryString("mode")
          .map(_ == "prod")
          .getOrElse(mode == Mode.Prod)

        val clientOptions = EditorClientOptions(
          debounceInMillis, StaticPaths.staticPaths
        )

        val bundle = bundler.bundleAll().get

        renderer.render("", clientOptions, bundle, prodMode).map{  h =>
          Ok(h)
        }
      }
    }}
  }
}
