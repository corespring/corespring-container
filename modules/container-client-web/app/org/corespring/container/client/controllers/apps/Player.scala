package org.corespring.container.client.controllers.apps

import java.io.{ BufferedReader, InputStreamReader, Reader }

import scala.concurrent.Future

import de.neuland.jade4j.{ Jade4J, JadeConfiguration }
import de.neuland.jade4j.template.{ JadeTemplate, TemplateLoader }
import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.model.Id
import play.api.{ Logger, Mode, Play }
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._
import play.api.templates.Html

trait BasePlayer
  extends PlayerItemTypeReader
  with AppWithServices[PlayerHooks]
  with JsModeReading {

  import org.corespring.container.client.controllers.apps.routes.{ BasePlayer => PlayerRoutes }

  override def context: String = "player"

  override def loggerName = "container.app.player"

  def showErrorInUi: Boolean

  override def servicesJs = {
    import org.corespring.container.client.controllers.resources.routes._
    PlayerServices(
      "player.services",
      Session.loadItemAndSession(":id"),
      Session.resetSession(":id"),
      Session.saveSession(":id"),
      Session.getScore(":id"),
      Session.completeSession(":id"),
      Session.loadOutcome(":id")).toString
  }

  def createSessionForItem(itemId: String): Action[AnyContent] = Action.async { implicit request =>
    hooks.createSessionForItem(itemId).map(handleSuccess { sessionId =>
      val file = request.queryString.get("file").map(_(0)).getOrElse("index.html")
      val url = s"${PlayerRoutes.loadPlayerForSession(sessionId).url}?file=$file&mode=gather"
      SeeOther(url)
    })
  }

  def loadPlayerForSession(sessionId: String) = Action.async { implicit request =>
    hooks.loadPlayerForSession(sessionId).flatMap { maybeError =>

      maybeError.map { sm =>
        val (code, msg) = sm
        Future(Ok(org.corespring.container.client.views.html.error.main(code, msg, showErrorInUi)))
      }.getOrElse {

        def playerPage(request: Request[AnyContent]) = {

          val jsMode = getJsMode(request)
          logger.trace(s"js mode: $jsMode")
          def has(n: String) = request.path.contains(n) || request.getQueryString("file") == Some(n)
          if (has("container-player.html")) s"container-player.$jsMode.html" else s"player.$jsMode.html"
        }

        val page = playerPage(request)
        logger.debug(s"[loadPlayerForSession] $sessionId - loading $page from /container-client")
        controllers.Assets.at("/container-client", page)(request)
      }
    }
  }

  override def additionalScripts: Seq[String] = Seq(PlayerRoutes.services().url)
}

trait JsonPlayer extends BasePlayer {}

private class TL(val root: String) extends TemplateLoader {

  import play.api.Play.current

  override def getLastModified(name: String): Long = Play.resource(s"$root/$name").map { url =>
    url.openConnection().getLastModified
  }.getOrElse { throw new RuntimeException(s"Unable to load jade file as a resource from: $root/$name") }

  override def getReader(name: String): Reader = Play.resource(s"$root/$name").map { url =>
    new BufferedReader(new InputStreamReader(url.openStream()))
  }.getOrElse { throw new RuntimeException(s"Unable to load jade file as a resource from: $root/$name") }
}

trait HtmlPlayer extends BasePlayer {

  import play.api.Play.current

  val name = "server-generated-player.jade"

  val jadeConfig = {
    val c = new JadeConfiguration
    c.setTemplateLoader(new TL("container-client"))
    c.setMode(Jade4J.Mode.HTML)
    c.setPrettyPrint(Play.mode == Mode.Dev)
    c
  }

  lazy val jadeTemplate: JadeTemplate = {
    jadeConfig.getTemplate(name)
  }

  def template(html: String, deps: Seq[String], js: Seq[String], css: Seq[String], json: JsValue) = {
    import scala.collection.JavaConversions._
    val params = Map(
      "html" -> html,
      "ngModules" -> s"[${deps.map(d => s"'$d'").mkString(",")}]",
      "js" -> js.toArray,
      "css" -> css.toArray,
      "sessionJson" -> Json.stringify(json))
    logger.trace(s"render jade with params: $params")

    val rendered = jadeConfig.renderTemplate(jadeTemplate, params)
    Html(new StringBuilder(rendered).toString)
  }

  override def config(id: String) = Action.async { implicit request =>

    hooks.loadSessionAndItem(id).map {
      case Left((code, msg)) => Status(code)(Json.obj("error" -> msg))
      case Right((session, itemJson)) => {

        val typeIds = componentTypes(itemJson).map {
          t =>
            val typeRegex(org, name) = t
            new Id(org, name)
        }

        val resolvedComponents = resolveComponents(typeIds, Some(context))
        val jsUrl = urls.jsUrl(context, resolvedComponents)
        val cssUrl = urls.cssUrl(context, resolvedComponents)

        val clientSideDependencies = getClientSideDependencies(resolvedComponents)
        val dependencies = ngModules.createAngularModules(resolvedComponents, clientSideDependencies)
        val js = (additionalScripts :+ jsUrl).distinct
        val css = Seq(cssUrl)

        Ok(template(processXhtml((itemJson \ "xhtml").asOpt[String]), dependencies, js, css, Json.obj("session" -> session, "item" -> itemJson)))
      }
    }
  }
}

trait DevHtmlPlayer extends HtmlPlayer {
  override def config(id: String) = Action(SeeOther(org.corespring.container.client.controllers.apps.routes.ProdHtmlPlayer.config(id).url))
}

trait ProdHtmlPlayer extends HtmlPlayer {}
