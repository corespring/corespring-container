package org.corespring.container.client.actions

import org.corespring.container.client.actions.Hooks.StatusMessage
import play.api.libs.json.JsValue
import play.api.mvc._

import scala.concurrent.Future

object Hooks {
  type StatusMessage = (Int, String)

}

/**
 * Client side calls - each will call for config, services and components
 */
trait ClientHooks {
  def loadComponents(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def loadServices(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def loadConfig(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
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

trait ItemHooks {
  def load(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def save(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[StatusMessage, String]]
}

trait SupportingMaterialHooks {
  def create(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, NewSupportingMaterial]]
}

trait SessionHooks {
  def loadEverything(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, FullSession]]

  def load(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def loadOutcome(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, SessionOutcome]]

  def getScore(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, SessionOutcome]]

  def save(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, SaveSession]]
}

trait PlayerLauncherHooks {
  def playerJs(implicit header: RequestHeader): Future[PlayerJs]

  def editorJs(implicit header: RequestHeader): Future[PlayerJs]
}

trait AssetHooks {
  def delete(itemId: String, file: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]

  def upload(itemId: String, file: String)(implicit header: RequestHeader): Future[Either[StatusMessage, BodyParser[Int]]]
}