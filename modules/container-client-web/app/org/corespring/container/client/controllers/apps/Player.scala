package org.corespring.container.client.controllers.apps

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.controllers.GetAsset
import org.corespring.container.client.controllers.helpers.PlayerXhtml
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.processing.PlayerItemPreProcessor
import play.api.http.ContentTypes
import play.api.libs.json._
import play.api.mvc.{ Action, AnyContent, RequestHeader }

import scala.concurrent.Future

trait Player
  extends App[PlayerHooks]
  with PlayerItemTypeReader
  with Jade
  with GetAsset[PlayerHooks] {

  /**
   * Preprocess the xml so that it'll work in all browsers
   * aka: convert tagNames -> attributes for ie 8 support
   * TODO: A layout component may have multiple elements
   * So we need a way to get all potential component names from
   * each component, not just assume its the top level.
   */
  def processXhtml(maybeXhtml: Option[String]) = maybeXhtml.map {
    xhtml =>
      PlayerXhtml.mkXhtml(components.map(_.componentType), xhtml)
  }.getOrElse("<div><h1>New Item</h1></div>")

  lazy val controlsJsSrc: SourcePaths = SourcePaths.fromJsonResource(modulePath, s"container-client/$context-controls-js-report.json")

  override def context: String = "player"

  def versionInfo: JsObject

  def itemPreProcessor: PlayerItemPreProcessor

  private def showControls(implicit r: RequestHeader): Boolean = {
    val show = r.getQueryString("showControls").map(_ == "true").getOrElse(false)
    logger.debug(s"showControls=$show")
    show
  }

  def playerConfig: V2PlayerConfig

  /**
   * A set of player query string params, that should be set on the player, but can be removed therafter
   */
  val playerQueryStringParams = Seq(
    /** show a simple submit button */
    "showControls",
    /** dev|prod - dev loads expanded js/css, prod loads minified */
    "mode",
    /** allow logging in the player */
    "loggingEnabled",
    /** if set log the category defined */
    "logCategory")

  /**
   * Query params:
   * mode=prod|dev (default: whichever way the app is run)
   * - dev mode loads all the js as separate files
   * - prod mode loads minified + concatenated js/css
   *
   * showControls=true|false (default: false)
   * - show simple player controls (for devs)
   *
   * loggingEnabled=true|false (default: false)
   * - implemented in the jade - whether to allow ng logging.
   *
   * @param sessionId
   * @return
   */
  override def load(sessionId: String) = Action.async { implicit request =>
    hooks.loadSessionAndItem(sessionId).map {

      case Left((code, msg)) => Status(code)(Json.obj("error" -> msg))
      case Right((session, itemJson)) => {

        logger.debug(s"function=load, queryString=${request.queryString}")

        val scriptInfo = componentScriptInfo(componentTypes(itemJson), jsMode == "dev")
        val controlsJs = if (showControls) paths(controlsJsSrc) else Seq.empty
        val domainResolvedJs = buildJs(scriptInfo, controlsJs)
        val domainResolvedCss = buildCss(scriptInfo)

        val processedXhtml = processXhtml((itemJson \ "xhtml").asOpt[String])
        val preprocessedItem = itemPreProcessor.preProcessItemForPlayer(itemJson).as[JsObject] ++ Json.obj("xhtml" -> processedXhtml)

        val newRelicRumConf: Option[JsValue] = playerConfig.newRelicRumConfig

        logger.trace(s"function=load domainResolvedJs=$domainResolvedJs")
        logger.trace(s"function=load domainResolvedCss=$domainResolvedCss")

        val queryParams = {
          val trimmed = (request.queryString -- playerQueryStringParams).mapValues(s => s.mkString(""))
          logger.trace(s"trimmed params: $trimmed")
          val asJson = trimmed.map( t => t._1 -> JsString(t._2.mkString(""))).toSeq
          logger.debug(s"service query params: $trimmed")
          JsObject(asJson)
        }

        Ok(
          renderJade(
            PlayerTemplateParams(
              context,
              domainResolvedJs,
              domainResolvedCss,
              jsSrc.ngModules ++ scriptInfo.ngDependencies,
              servicesJs(queryParams),
              showControls,
              Json.obj("session" -> session, "item" -> preprocessedItem),
              versionInfo,
              newRelicRumConf != None,
              newRelicRumConf.getOrElse(Json.obj()))))
      }
    }
  }


  def stubPost(itemId:String) = Action.async { implicit request =>
    Future(Ok(s"<html><body> >> $itemId</body></html>").as(ContentTypes.HTML))
  }

  def createSessionForItem(itemId: String): Action[AnyContent] = Action.async { implicit request =>
    hooks.createSessionForItem(itemId).map(handleSuccess { sessionId =>
      val call = org.corespring.container.client.controllers.apps.routes.Player.load(sessionId)
      val url: String = s"${call.url}?${request.rawQueryString}"
      SeeOther(url)
    })
  }

  def servicesJs(queryParams:JsObject) = {
    import org.corespring.container.client.controllers.resources.routes._
    PlayerServices(
      "player.services",
      Session.loadItemAndSession(":id"),
      Session.reopenSession(":id"),
      Session.resetSession(":id"),
      Session.saveSession(":id"),
      Session.getScore(":id"),
      Session.completeSession(":id"),
      Session.loadOutcome(":id"),
      queryParams).toString
  }
}
