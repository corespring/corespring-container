package org.corespring.container.client.controllers.apps

import java.io.{Reader, InputStreamReader, BufferedReader, FileReader}
import java.net.URL

import de.neuland.jade4j.{JadeConfiguration, Jade4J}
import de.neuland.jade4j.template.{FileTemplateLoader, JadeTemplate}
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.model.Id
import play.api.{Play, Logger}
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._
import play.api.templates.{Html, HtmlFormat}

import scala.concurrent.Future

trait BasePlayer
  extends PlayerItemTypeReader
  with AppWithServices[PlayerHooks]
  with JsModeReading {

  import org.corespring.container.client.controllers.apps.routes.{ BasePlayer => PlayerRoutes }

  override def context: String = "player"

  override lazy val logger = Logger("container.player")

  override def servicesJs = {
    import org.corespring.container.client.controllers.resources.routes._
    PlayerServices(
      "player.services",
      Session.loadEverything(":id"),
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
        Future(Ok(org.corespring.container.client.views.html.error.main(code, msg)))
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

trait HtmlPlayer extends BasePlayer {

  val jadeConfig = {
    val c = new JadeConfiguration
    c.setTemplateLoader(new FileTemplateLoader("container-client/", "UTF-8"))
    c.setMode(Jade4J.Mode.HTML)
    c.setPrettyPrint(false)
    c
  }

  lazy val jadeTemplate : JadeTemplate = {
    val name = "opt-player.jade"
    Jade4J.getTemplate(name)
  }

  //String html = Jade4J.render(template, model);

  val template : (String, Seq[String], Seq[String], Seq[String], JsValue) => play.api.templates.HtmlFormat.Appendable

  override def config(id: String) = Action.async { implicit request =>

    hooks.loadSessionAndItem(id).map{
      case Left((code,msg)) => Status(code)(Json.obj("error" -> msg))
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
        val clientSideScripts = get3rdPartyScripts(clientSideDependencies)
        val localScripts = getLocalScripts(resolvedComponents)
        val js = (clientSideScripts ++ localScripts ++ additionalScripts :+ jsUrl).distinct
        val css = Seq(cssUrl)

        Ok(template(processXhtml((itemJson \ "xhtml").asOpt[String]), dependencies, js, css, Json.obj( "session" -> session, "item" -> itemJson)))
        }
      }
    }
  }

trait DevHtmlPlayer extends HtmlPlayer{
  override val template = { (html:String, deps : Seq[String], js : Seq[String], css : Seq[String], json : JsValue) =>
    import scala.collection.JavaConversions._
    val m : java.util.Map[String,Object] = Map[String,Object]()
    val out : String = jadeConfig.renderTemplate(jadeTemplate, m)//.renderTemplate(jadeTemplate, locals)
    Html(new StringBuilder("hi").toString)
  }
}

trait ProdHtmlPlayer extends HtmlPlayer {
  override val template = org.corespring.container.client.views.html.playerProd.apply _
}
