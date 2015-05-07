package org.corespring.container.client.controllers.apps

import org.apache.commons.io.IOUtils
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
import play.api.mvc._

import scala.concurrent._
import scala.concurrent.duration._

import scala.concurrent.Future

trait Player
  extends App[PlayerHooks]
  with PlayerItemTypeReader
  with Jade
  with GetAsset[PlayerHooks] {

  //import SessionRenderer._

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

//<<<<<<< HEAD
  /**
   * A set of player query string params, that should be set on the player, but can be removed therafter
   */
  val playerQueryStringParams = Seq(

    /**
     * show a simple submit button
     * showControls=true|false (default: false)
     * - show simple player controls (for devs)
     */
    "showControls",

    /**
     * dev|prod - dev loads expanded js/css, prod loads minified
     * mode=prod|dev (default: whichever way the app is run)
     * - dev mode loads all the js as separate files
     * - prod mode loads minified + concatenated js/css
     */
    "mode",

    /**
     * allow logging in the player
     * loggingEnabled=true|false (default: false)
     * - implemented in the jade - whether to allow ng logging.
     */
    "loggingEnabled",

    /** if set log the category defined */
    "logCategory")

  override def load(sessionId: String) = Action.async { implicit request =>
    hooks.loadSessionAndItem(sessionId).map {

      case Left((code, msg)) => Status(code)(Json.obj("error" -> msg))
      case Right((session, itemJson)) => {

        logger.debug(s"function=load, queryString=${request.queryString}")

        val scriptInfo = componentScriptInfo(componentTypes(itemJson), jsMode == "dev")
        val controlsJs = if (showControls) paths(controlsJsSrc) else Seq.empty
        val domainResolvedJs = buildJs(scriptInfo, controlsJs)
        val domainResolvedCss = buildCss(scriptInfo)
/*=======
  @deprecated("Do not call GETs to this route", "0.36.0")
  def createSessionForItem(itemId: String): Action[AnyContent] = Action.async { implicit request =>
    hooks.createSessionForItem(itemId).map(handleSuccess { sessionId =>
      SeeOther(s"${routes.Player.load(sessionId).url}?${request.rawQueryString}")
    })
  }

  override def load(sessionId: String) = Action.async { implicit request => loadSession(sessionId) }
>>>>>>> feature/PE-233 */

  def createSession(itemId: String): Action[AnyContent] = Action.async { implicit request =>
    hooks.createSessionForItem(itemId).flatMap(handleSuccess.async { loadSession(_, status = Created) })
  }

  private def loadSession(sessionId: String, status: Status = Ok)(implicit request: RequestHeader) =
    request.path.endsWith("index.html") match {
      case true => sessionAsHTML(sessionId)
      case _ => render.async {
        /** Always provide JSON, unless request accepts HTML and not JSON **/
        case Accepts.Json() & Accepts.Html() => sessionAsJSON(sessionId, status)
        case Accepts.Json() => sessionAsJSON(sessionId, status)
        case Accepts.Html() => sessionAsHTML(sessionId, status)
        case _ => sessionAsJSON(sessionId, status)
      }
    }

  lazy val servicesJs = {
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

//<<<<<<< HEAD
        val queryParams = {
          val trimmed = (request.queryString -- playerQueryStringParams).mapValues(s => s.mkString(""))
          logger.trace(s"trimmed params: $trimmed")
          val asJson = trimmed.map(t => t._1 -> JsString(t._2.mkString(""))).toSeq
          logger.debug(s"service query params: $trimmed")
          JsObject(asJson)
        }

        Ok(
          renderJade(
/*=======
  private object SessionRenderer {

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
    def sessionAsHTML(sessionId: String, status: Status = Ok)(implicit request: RequestHeader): Future[SimpleResult] =
      hooks.loadSessionAndItem(sessionId).map {
        case Left((code, msg)) => Status(code)(Json.obj("error" -> msg))
        case Right((session, itemJson)) => {

          val scriptInfo = componentScriptInfo(componentTypes(itemJson), jsMode == "dev")
          val controlsJs = if (showControls) paths(controlsJsSrc) else Seq.empty
          val domainResolvedJs = buildJs(scriptInfo, controlsJs)
          val domainResolvedCss = buildCss(scriptInfo)

          val processedXhtml = processXhtml((itemJson \ "xhtml").asOpt[String])
          val preprocessedItem = itemPreProcessor.preProcessItemForPlayer(itemJson).as[JsObject] ++ Json.obj("xhtml" -> processedXhtml)

          val newRelicRumConf: Option[JsValue] = playerConfig.newRelicRumConfig

          logger.trace(s"function=load domainResolvedJs=$domainResolvedJs")
          logger.trace(s"function=load domainResolvedCss=$domainResolvedCss")

          val result = renderJade(
>>>>>>> feature/PE-233 */
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
              newRelicRumConf.getOrElse(Json.obj())))

          status(result).as(ContentTypes.HTML)
        }
      }

//<<<<<<< HEAD
  def stubPost(itemId: String) = Action.async { implicit request =>
    Future(Ok(s"<html><body> >> $itemId</body></html>").as(ContentTypes.HTML))
  }

  def createSessionForItem(itemId: String): Action[AnyContent] = Action.async { implicit request =>
    hooks.createSessionForItem(itemId).map(handleSuccess { sessionId =>
      val call = org.corespring.container.client.controllers.apps.routes.Player.load(sessionId)
      val url: String = s"${call.url}?${request.rawQueryString}"
      SeeOther(url)
    })
  }

  def servicesJs(queryParams: JsObject) = {
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
/*=======
    def sessionAsJSON(sessionId: String, status: Status = Ok)(implicit request: RequestHeader): Future[SimpleResult] =
      hooks.loadSessionAndItem(sessionId).map {
        case Left((code, msg)) => Status(code)(Json.obj("error" -> msg))
        case Right((session, _)) => status(Json.prettyPrint(session)).as(ContentTypes.JSON)
      }
  }

>>>>>>> feature/PE-233*/
}
