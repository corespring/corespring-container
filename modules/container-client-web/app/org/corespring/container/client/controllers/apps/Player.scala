package org.corespring.container.client.controllers.apps

import java.net.URLEncoder

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.controllers.GetAsset
import org.corespring.container.client.controllers.helpers.PlayerXhtml
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.processing.PlayerItemPreProcessor
import play.api.http.{ ContentTypes }
import play.api.libs.json._
import play.api.mvc.{ Action, AnyContent, RequestHeader }
import play.api.templates.Html

trait Player
  extends App[PlayerHooks]
  with PlayerItemTypeReader
  with Jade
  with GetAsset[PlayerHooks] {

  private object SessionRenderer {

    /**
     * Preprocess the xml so that it'll work in all browsers
     * aka: convert tagNames -> attributes for ie 8 support
     * TODO: A layout component may have multiple elements
     * So we need a way to get all potential component names from
     * each component, not just assume its the top level.
     */
    private def processXhtml(maybeXhtml: Option[String]) = maybeXhtml.map {
      xhtml =>
        PlayerXhtml.mkXhtml(components.map(_.componentType), xhtml)
    }.getOrElse("<div><h1>New Item</h1></div>")

    def createPlayerHtml(sessionId: String, session: JsValue, itemJson: JsValue, serviceParams: JsObject)(implicit rh: RequestHeader): Html = {

      val scriptInfo = componentScriptInfo(componentTypes(itemJson), jsMode == "dev")
      val controlsJs = if (showControls) paths(controlsJsSrc) else Seq.empty
      val domainResolvedJs = buildJs(scriptInfo, controlsJs)
      val domainResolvedCss = buildCss(scriptInfo)

      val processedXhtml = processXhtml((itemJson \ "xhtml").asOpt[String])
      val preprocessedItem = itemPreProcessor.preProcessItemForPlayer(itemJson).as[JsObject] ++ Json.obj("xhtml" -> processedXhtml)

      val newRelicRumConf: Option[JsValue] = playerConfig.newRelicRumConfig

      logger.trace(s"function=load domainResolvedJs=$domainResolvedJs")
      logger.trace(s"function=load domainResolvedCss=$domainResolvedCss")

      renderJade(
        PlayerTemplateParams(
          context,
          domainResolvedJs,
          domainResolvedCss,
          jsSrc.ngModules ++ scriptInfo.ngDependencies,
          servicesJs(sessionId, serviceParams),
          showControls,
          Json.obj("session" -> session, "item" -> preprocessedItem),
          versionInfo,
          newRelicRumConf != None,
          newRelicRumConf.getOrElse(Json.obj())))

    }
  }

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

  import SessionRenderer._

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

  def load(sessionId: String) = Action.async { implicit request =>
    hooks.loadSessionAndItem(sessionId).map {
      handleSuccess { (tuple) =>
        val (session, item) = tuple
        require((session \ "id").asOpt[String].isDefined, "The session model must specify an 'id'")
        Ok(createPlayerHtml((session \ "id").as[String], session, item, queryParams(mapToJson))).as(ContentTypes.HTML)
      }
    }
  }

  def mapToParamString(m: Map[String, String]): String = m.toSeq.map { t =>
    val (key, value) = t
    val encodedValue = URLEncoder.encode(value, "utf-8")
    s"$key=$encodedValue"
  }.mkString("&")

  def mapToJson(m: Map[String, String]): JsObject = {
    import play.api.libs.json._
    Json.toJson(m).asInstanceOf[JsObject]
  }

  private def queryParams[A](build: (Map[String, String] => A) = mapToParamString _)(implicit rh: RequestHeader): A = {
    val trimmed = (rh.queryString -- playerQueryStringParams).mapValues(s => s.mkString(""))
    build(trimmed)
  }

  def createSessionForItem(itemId: String): Action[AnyContent] = Action.async { implicit request =>
    hooks.createSessionForItem(itemId).map {
      handleSuccess { (tuple) =>
        val (session, item) = tuple
        require((session \ "id").asOpt[String].isDefined, "The session model must specify an 'id'")
        val call = org.corespring.container.client.controllers.apps.routes.Player.load((session \ "id").as[String])
        val location = {
          val params = queryParams[String]()
          s"${call.url}${if (params.isEmpty) "" else s"?$params"}"
        }
        Created(createPlayerHtml((session \ "id").as[String], session, item, queryParams(mapToJson)))
          .as(ContentTypes.HTML)
          .withHeaders(LOCATION -> location)
      }
    }
  }

  def getFileByItemId(itemId:String, file:String) = Action.async { request => hooks.loadItemFile(itemId, file)(request)}

  private def servicesJs(sessionId: String, queryParams: JsObject) = {
    import org.corespring.container.client.controllers.resources.routes._
    PlayerServices(
      "player.services",
      Session.loadItemAndSession(sessionId),
      Session.reopenSession(sessionId),
      Session.resetSession(sessionId),
      Session.saveSession(sessionId),
      Session.getScore(sessionId),
      Session.completeSession(sessionId),
      Session.loadOutcome(sessionId),
      queryParams).toString
  }
}
