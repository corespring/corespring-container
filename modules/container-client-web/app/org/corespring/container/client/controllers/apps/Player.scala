package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.{ ComponentBundler, ItemComponentTypes }
import org.corespring.container.client.controllers.GetAsset
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.PlayerRenderer
import org.corespring.container.components.services.ComponentService
import play.api.Mode
import play.api.Mode.Mode
import play.api.http.ContentTypes
import play.api.libs.json.{ JsObject, JsValue }
import play.api.mvc._
import play.api.templates.Html

import scala.concurrent.Future

class Player(mode: Mode,
  bundler: ComponentBundler,
  val containerContext: ContainerExecutionContext,
  playerRenderer: PlayerRenderer,
  componentService: ComponentService,
  val hooks: PlayerHooks)
  extends Controller
  with GetAsset[PlayerHooks]
  with QueryStringHelper{

  private def handleSuccess[D](fn: (D) => Future[SimpleResult])(e: Either[StatusMessage, D]): Future[SimpleResult] = e match {
    case Left((code, msg)) => Future { Status(code)(msg) }
    case Right(s) => fn(s)
  }

  private def createPlayerHtml(sessionId: String, session: JsValue, item: JsValue)(implicit r: RequestHeader): Either[String, Future[Html]] = {

    val ids = ItemComponentTypes(componentService, item).map(_.id)

    val prodMode = r.getQueryString("mode").map(_ == "prod").getOrElse(mode == Mode.Prod)
    val queryParams = mkQueryParams(mapToJson)
    val colors = (queryParams \ "colors").asOpt[String]
    val iconSet = (queryParams \ "iconSet").asOpt[String]

    bundler.bundle(ids, "player", Some("player"), !prodMode, colors) match {
      case Some(b) => {
        val hasBeenArchived = hooks.archiveCollectionId == (session \ "collectionId")
        val showControls = r.getQueryString("showControls").map(_ == "true").getOrElse(false)
        val queryParams = mkQueryParams(m => m)

        val warnings: Seq[String] = if (hasBeenArchived) {
          Seq("Warning: This item has been deleted")
        } else {
          Nil
        }

        Right(
          playerRenderer.render(sessionId, session, item, b, warnings, queryParams, prodMode, showControls))
      }
      case _ => Left(s"Failed to create a bundle for: $sessionId")
    }
  }

  def load(sessionId: String) = Action.async { implicit request =>
    hooks.loadSessionAndItem(sessionId).flatMap {
      handleSuccess { (tuple) =>
        val (session, item) = tuple
        require((session \ "id").asOpt[String].isDefined, "The session model must specify an 'id'")
        createPlayerHtml(sessionId, session, item) match {
          case Left(e) => Future.successful(BadRequest(e))
          case Right(f) => f.map(Ok(_))
        }
      }
    }
  }



  /**
    * show a simple submit button
    * showControls=true|false (default: false)
    * - show simple player controls (for devs)
    */
  val showControls = "showControls"

  /**
   * A set of player query string params, that should be set on the player, but can be removed therafter
   */
  override val paramsToStrip = showControls +: StrippableParams.params

  def createSessionForItem(itemId: String): Action[AnyContent] = Action.async { implicit request =>
    hooks.createSessionForItem(itemId).flatMap {
      handleSuccess { (tuple) =>
        val (session, item) = tuple
        require((session \ "id").asOpt[String].isDefined, "The session model must specify an 'id'")
        createPlayerHtml((session \ "id").as[String], session, item) match {
          case Left(e) => Future.successful(BadRequest(e))
          case Right(f) => f.map { html =>
            lazy val call = org.corespring.container.client.controllers.apps.routes.Player.load((session \ "id").as[String])
            lazy val location = {
              val params = mkQueryParams[String]()
              s"${call.url}${if (params.isEmpty) "" else s"?$params"}"
            }
            Created(html)
              .as(ContentTypes.HTML)
              .withHeaders(LOCATION -> location)
          }
        }
      }
    }
  }

  def getFileByItemId(itemId: String, file: String) = Action.async {
    implicit request =>
      Future {
        hooks.loadItemFile(itemId, file)(request)
      }
  }
}
