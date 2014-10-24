package org.corespring.container.client.controllers.apps

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.PlayerItemTypeReader
import org.corespring.container.client.controllers.jade.Jade
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.processing.PlayerItemPreProcessor
import play.api.libs.json.{Json}
import play.api.mvc.{Action, AnyContent, RequestHeader}
import play.api.libs.json.{JsObject, JsValue, Json}

trait Player
  extends App[PlayerHooks]
  with PlayerItemTypeReader
  with Jade{

  /**
   * Preprocess the xml so that it'll work in all browsers
   * aka: convert tagNames -> attributes for ie 8 support
   * TODO: A layout component may have multiple elements
   * So we need a way to get all potential component names from
   * each component, not just assume its the top level.
   */
  def processXhtml(maybeXhtml: Option[String]) = maybeXhtml.map {
    xhtml =>
      tagNamesToAttributes(xhtml).getOrElse {
        throw new RuntimeException(s"Error processing xhtml: $xhtml")
      }
  }.getOrElse("<div><h1>New Item</h1></div>")

  lazy val controlsJsSrc: SourcePaths = SourcePaths.fromJsonResource(modulePath, s"container-client/$context-controls-js-report.json")

  override def context: String = "player"

  def itemPreProcessor: PlayerItemPreProcessor

  override def additionalScripts: Seq[String] = Seq(org.corespring.container.client.controllers.apps.routes.Player.services().url)

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
        val controlsJs = if (showControls) paths(controlsJsSrc) else Seq.empty
        val domainResolvedJs = buildJs(scriptInfo, controlsJs )
        val domainResolvedCss = buildCss(scriptInfo)

        val processedXhtml = processXhtml((itemJson \ "xhtml").asOpt[String])
        val preprocessedItem = itemPreProcessor.preProcessItemForPlayer(itemJson).as[JsObject] ++ Json.obj("xhtml" -> processedXhtml)

        logger.trace(s"function=load domainResolvedJs=$domainResolvedJs")
        logger.trace(s"function=load domainResolvedCss=$domainResolvedCss")

        Ok(
          renderJade(
            PlayerTemplateParams(
              context,
              domainResolvedJs,
              domainResolvedCss,
              scriptInfo.ngDependencies,
              showControls,
              Json.obj("session" -> session, "item" -> preprocessedItem),
              VersionInfo.json
            ))
        )
      }
    }
  }

  //TODO: CA-2186 - catalog + rig support
  //TODO: CA-2186 - clean up grunt
  //TODO: CA-2186 - set up other build items
  //TODO: CA-2186 - remove old parts of the api


  def createSessionForItem(itemId: String): Action[AnyContent] = Action.async { implicit request =>
    hooks.createSessionForItem(itemId).map(handleSuccess { sessionId =>
      val call = org.corespring.container.client.controllers.apps.routes.Player.load(sessionId)
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
