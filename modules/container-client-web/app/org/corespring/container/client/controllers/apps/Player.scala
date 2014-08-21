package org.corespring.container.client.controllers.apps

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.controllers.player.PlayerQueryStringOptions
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.model.Id
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._

import scala.concurrent.Future

trait BasePlayer
  extends PlayerItemTypeReader
  with AppWithServices[PlayerHooks]
  with JsModeReading
  with PlayerQueryStringOptions {

  import org.corespring.container.client.controllers.apps.routes.{ ProdHtmlPlayer, BasePlayer => PlayerRoutes }

  override def context: String = "player"

  override def loggerName = "container.app.player"

  def showErrorInUi: Boolean

  override def servicesJs = {
    import org.corespring.container.client.controllers.resources.routes._
    PlayerServices(
      "player.services",
      Session.loadItemAndSession(":id"),
      Session.reopenSession(":id"),
      Session.resetSession(":id"),
      Session.saveSession(":id"),
      Session.getScore(":id"),
      Session.completeSession(":id"),
      Session.loadOutcome(":id")).toString
  }

  def createSessionForItem(itemId: String): Action[AnyContent] = Action.async { implicit request =>
    hooks.createSessionForItem(itemId).map(handleSuccess { sessionId =>

      val url: String = isProdPlayer match {
        case true => s"${ProdHtmlPlayer.config(sessionId).url}?${request.rawQueryString}"
        case _ => s"${PlayerRoutes.loadPlayerForSession(sessionId).url}?${request.rawQueryString}"
      }
      SeeOther(url)
    })
  }

  def loadPlayerForSession(sessionId: String) = Action.async { implicit request =>
    hooks.loadPlayerForSession(sessionId).flatMap { maybeError =>

      maybeError.map { sm =>
        val (code, msg) = sm
        Future(Ok(org.corespring.container.client.views.html.error.main(code, msg, showErrorInUi)))
      }.getOrElse {

        def playerPage(implicit request: Request[AnyContent]) = {
          val jsMode = getJsMode(request)
          logger.trace(s"js mode: $jsMode")
          if (getPlayerPage == "container-player.html") s"container-player.$jsMode.html" else s"player.$jsMode.html"
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

/**
 * The ProdHtmlPlayer serves server side generated html.
 * This is to speed up this player load time and performance
 */
trait ProdHtmlPlayer extends BasePlayer with Jade {

  val name = "server-generated-player.jade"

  val prefix = v2Player.Routes.prefix

  def template(html: String, deps: Seq[String], js: Seq[String], css: Seq[String], json: JsValue) = {
    val params: Map[String, Object] = Map(
      "html" -> html,
      "ngModules" -> s"[${deps.map(d => s"'$d'").mkString(",")}]",
      "js" -> js.toArray,
      "css" -> css.toArray,
      "sessionJson" -> Json.stringify(json),
      "versionInfo" -> Json.stringify(VersionInfo.json))
    logger.trace(s"render jade with params: $params")
    renderJade(name, params)
  }

  def coreJs = Seq(
    s"$prefix/js/root-prod-player.js",
    s"$prefix/components/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML")

  def coreCss = Seq(
    s"$prefix/css/player.min.css",
    s"$prefix/components/font-awesome/css/font-awesome.min.css")

  def resolveDomain(path: String): String = path

  /**
   * A temporary means of defining paths that may be resolved
   */
  private def resolvePath(s: String): String = {
    val needsResolution = Seq(
      "component-sets/",
      "components/",
      "root-prod-player",
      "player-services.js",
      "player.min").exists(s.contains)
    if (needsResolution) resolveDomain(s) else s
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

        val js = coreJs ++ (additionalScripts :+ jsUrl).distinct

        val domainResolvedJs = js.map(resolvePath)
        val css = coreCss :+ cssUrl
        val domainResolvedCss = css.map(resolvePath)

        Ok(
          template(
            processXhtml(
              (itemJson \ "xhtml").asOpt[String]),
            dependencies,
            domainResolvedJs,
            domainResolvedCss,
            Json.obj("session" -> session, "item" -> itemJson)))
      }
    }
  }
}
