package org.corespring.container.client.hooks

import org.corespring.container.client.hooks.Hooks.StatusMessage
import play.api.libs.json.JsValue
import play.api.mvc._

import scala.concurrent.{ ExecutionContext, Future }

object Hooks {
  type StatusMessage = (Int, String)
}

trait HasContext {
  implicit def ec: ExecutionContext = ExecutionContext.Implicits.global
}
/**
 * Client side calls - each will call for config, services and components
 */
trait ClientHooks extends HasContext {
  def loadItem(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
}

trait PlayerHooks extends ClientHooks {
  def createSessionForItem(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, String]]

  def loadPlayerForSession(sessionId: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]
}

trait EditorHooks extends ClientHooks {
  def createItem(implicit header: RequestHeader): Future[Either[StatusMessage, PlayerData]]

  def editItem(itemId: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]
}

trait CatalogHooks extends ClientHooks {
  def showCatalog(itemId: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]
}

trait ItemHooks extends HasContext {
  def load(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def save(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[StatusMessage, String]]
}

trait SupportingMaterialHooks extends HasContext {
  def create(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, NewSupportingMaterial]]
}

trait SessionHooks extends HasContext {
  def loadEverything(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, FullSession]]

  def load(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def loadOutcome(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, SessionOutcome]]

  def getScore(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, SessionOutcome]]

  def save(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, SaveSession]]
}

trait PlayerLauncherHooks extends HasContext {
  def playerJs(implicit header: RequestHeader): Future[PlayerJs]

  def editorJs(implicit header: RequestHeader): Future[PlayerJs]
}

trait AssetHooks extends HasContext {
  def delete(itemId: String, file: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]

  /**
   * TODO: it would be preferble to have a signature as follows
   * {{{
   * def upload(itemId: String, file: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]
   * }}}
   */
  def uploadAction(itemId: String, file: String)(block: Request[Int] => SimpleResult): Action[Int]
}