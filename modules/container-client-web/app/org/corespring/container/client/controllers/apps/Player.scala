package org.corespring.container.client.controllers.apps

import java.net.URLEncoder

import org.corespring.container.client.component.{ComponentBundler, ItemComponentTypes}
import org.corespring.container.client.controllers.GetAsset
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks.PlayerHooks
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.PlayerRenderer
import org.corespring.container.components.services.ComponentService
import play.api.Mode
import play.api.Mode.Mode
import play.api.http.ContentTypes
import play.api.libs.json.{JsObject, JsValue}
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
  with GetAsset[PlayerHooks] {

  private def handleSuccess[D](fn: (D) => Future[SimpleResult])(e: Either[StatusMessage, D]): Future[SimpleResult] = e match {
    case Left((code, msg)) => Future { Status(code)(msg) }
    case Right(s) => fn(s)
  }

  private def createPlayerHtml(sessionId: String, session: JsValue, item: JsValue, prodMode: Boolean): Either[String, Future[Html]] = {
    val ids = ItemComponentTypes(componentService, item).map(_.id)

    bundler.bundle(ids, "player", Some("player"), !prodMode) match {
      case Some(b) => {
        val hasBeenArchived = hooks.archiveCollectionId == (session \ "collectionId")

        val warnings: Seq[String] = if (hasBeenArchived) {
          Seq("Warning: This item has been deleted")
        } else {
          Nil
        }

        Right(
          playerRenderer.render(sessionId, session, item, b, warnings, prodMode)
        )
      }
      case _ => Left(s"Failed to create a bundle for: $sessionId")
    }
  }

  def load(sessionId: String) = Action.async { implicit request =>
    hooks.loadSessionAndItem(sessionId).flatMap {
      handleSuccess { (tuple) =>
        val (session, item) = tuple
        require((session \ "id").asOpt[String].isDefined, "The session model must specify an 'id'")
        val prodMode = request.getQueryString("mode").map(_ == "prod").getOrElse(mode == Mode.Prod)
        createPlayerHtml(sessionId, session, item, prodMode) match {
          case Left(e) => Future.successful(BadRequest(e))
          case Right(f) => f.map(Ok(_))
        }
      }
    }
  }

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
    hooks.createSessionForItem(itemId).flatMap {
      handleSuccess { (tuple) =>
        val (session, item) = tuple
        require((session \ "id").asOpt[String].isDefined, "The session model must specify an 'id'")
        val prodMode = request.getQueryString("mode").map(_ == "prod").getOrElse(mode == Mode.Prod)

        createPlayerHtml((session \ "id").as[String], session, item, prodMode) match {
          case Left(e) => Future.successful(BadRequest(e))
          case Right(f) => f.map { html =>
            lazy val call = org.corespring.container.client.controllers.apps.routes.Player.load((session \ "id").as[String])
            lazy val location = {
              val params = queryParams[String]()
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
