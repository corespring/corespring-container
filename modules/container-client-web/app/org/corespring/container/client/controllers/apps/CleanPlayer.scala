package org.corespring.container.client.controllers.apps

import java.net.URL

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.model.Id
import org.corespring.container.components.processing.PlayerItemPreProcessor
import play.api.Play
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc.{ Action, AnyContent }

case class SourceDef(src: Seq[String], dest: String)

trait CleanPlayer
  extends AppWithServices[PlayerHooks]
  with PlayerItemTypeReader
  with JsModeReading
  with Jade {

  import play.api.Play.current

  lazy val jsSrc: SourceDef = {
    Play.resource("container-client/player-report.json").map { u: URL =>
      val bs = scala.io.Source.fromURL(u)
      val jsonString: String = bs.getLines().mkString("\n")
      bs.close()
      val json = Json.parse(jsonString)
      val src = (json \ "src").as[Seq[String]].map(p => s"$modulePath$p")
      val dest = s"$modulePath${(json \ "dest").as[String]}"
      SourceDef(src, dest)
    }.getOrElse(
      throw new RuntimeException("Bad player report"))
  }

  val name = "new-player.jade"

  override def context: String = "player"

  /** Allow external domains to be configured */
  def resolveDomain(path: String): String = path

  def itemPreProcessor: PlayerItemPreProcessor

  override def additionalScripts: Seq[String] = Seq(org.corespring.container.client.controllers.apps.routes.CleanPlayer.services().url)

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
  def load(sessionId: String) = Action.async { implicit request =>

    hooks.loadSessionAndItem(sessionId).map {
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

        val jsMode = request.getQueryString("mode").getOrElse(
          Play.current.mode.toString.toLowerCase)

        val jsToLoad = jsMode match {
          case "prod" => Seq(jsSrc.dest)
          case "dev" => jsSrc.src
          case _ => throw new RuntimeException(s"Wrong mode $jsMode") //PlayerError()
        }
        val js = jsToLoad ++ (additionalScripts :+ jsUrl).distinct

        val domainResolvedJs = js.map(resolvePath)
        val css = Seq(s"$modulePath/css/player.css", cssUrl)
        val domainResolvedCss = css.map(resolvePath)

        val preprocessedItem = itemPreProcessor.preProcessItemForPlayer(itemJson)

        Ok(
          template(
            processXhtml(
              (itemJson \ "xhtml").asOpt[String]),
            dependencies,
            domainResolvedJs,
            domainResolvedCss,
            Json.obj("session" -> session, "item" -> preprocessedItem)))

      }

    }

  }

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
