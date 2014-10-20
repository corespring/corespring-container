package org.corespring.container.client.controllers.apps

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.model.Id
import org.corespring.container.components.processing.PlayerItemPreProcessor
import play.api.Play
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.{ Action, AnyContent, RequestHeader }

trait Player
  extends AppWithServices[PlayerHooks]
  with PlayerItemTypeReader
  with JsModeReading {

  lazy val controlsJsSrc: SourcePaths = SourcePaths.fromJsonResource(modulePath, s"container-client/$context-controls-js-report.json")

  override def context: String = "player"

  def itemPreProcessor: PlayerItemPreProcessor

  override def additionalScripts: Seq[String] = Seq(org.corespring.container.client.controllers.apps.routes.CleanPlayer.services().url)

  private def showControls(implicit r: RequestHeader): Boolean = {
    r.getQueryString("showControls").map(_ == "true").getOrElse(false)
  }

  /**
   * Query params:
   * mode=prod|dev (default: whichever way the app is run)
   * - dev mode loads all the js as separate files
   * - prod mode loads minified + concatenated js/css
   *
   * showControls=true|false (default: false)
   * - show simple player controls (for devs)
   *
   * @param sessionId
   * @return
   */
  override def load(sessionId: String) = Action.async { implicit request =>

    hooks.loadSessionAndItem(sessionId).map {
      case Left((code, msg)) => Status(code)(Json.obj("error" -> msg))
      case Right((session, itemJson)) => {

        val scriptInfo = componentScriptInfo(itemJson)
        val mainJs = paths(jsSrc)
        val controlsJs = if (showControls) paths(controlsJsSrc) else Seq.empty

        val js = mainJs ++ controlsJs ++ jsSrc.otherLibs ++ (additionalScripts :+ scriptInfo.jsUrl).distinct

        val domainResolvedJs = js.map(resolvePath)
        val css = Seq(cssSrc.dest) ++ cssSrc.otherLibs :+ scriptInfo.cssUrl
        val domainResolvedCss = css.map(resolvePath)

        val preprocessedItem = itemPreProcessor.preProcessItemForPlayer(itemJson)

        Ok(
          template(
            showControls,
            processXhtml(
              (itemJson \ "xhtml").asOpt[String]),
            scriptInfo.ngDependencies,
            domainResolvedJs,
            domainResolvedCss,
            Json.obj("session" -> session, "item" -> preprocessedItem)))
      }

    }

  }

  def template(
    showControls: Boolean,
    html: String,
    deps: Seq[String],
    js: Seq[String],
    css: Seq[String],
    json: JsValue) = {
    val params: Map[String, Object] = Map(
      "showControls" -> new java.lang.Boolean(showControls),
      "html" -> html,
      "ngModules" -> s"[${deps.map(d => s"'$d'").mkString(",")}]",
      "js" -> js.toArray,
      "css" -> css.toArray,
      "sessionJson" -> Json.stringify(json),
      "versionInfo" -> Json.stringify(VersionInfo.json))
    logger.trace(s"render jade with params: $params")
    renderJade(s"$context.jade", params)
  }

  def createSessionForItem(itemId: String): Action[AnyContent] = Action.async { implicit request =>
    hooks.createSessionForItem(itemId).map(handleSuccess { sessionId =>
      val call = org.corespring.container.client.controllers.apps.routes.CleanPlayer.load(sessionId)
      val url: String = s"${call.url}?${request.rawQueryString}"
      SeeOther(url)
    })
  }

  override lazy val servicesJs = {
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
}
