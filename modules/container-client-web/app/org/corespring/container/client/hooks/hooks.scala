package org.corespring.container.client.hooks

import org.corespring.container.client.HasContext
import org.corespring.container.client.hooks.Hooks.StatusMessage
import play.api.libs.json.{ JsString, JsArray, JsValue }
import play.api.mvc._

import scala.concurrent.Future

object Hooks {
  type StatusMessage = (Int, String)
}

/**
 * Client side calls - each will call for config, services and components
 */
trait ClientHooks extends HasContext {

  /**
   * load the item with the id into the editor, aka it will be read+write access.
   * If returning a status message - you can optionally return a SEE_OTHER status and it will be handled correctly
   * @param id
   * @param header
   * @return
   */
  def loadItem(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
}

trait PlayerHooks extends ClientHooks {
  def createSessionForItem(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, String]]
  def loadSessionAndItem(sessionId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, (JsValue, JsValue)]]
}

trait EditorHooks extends ClientHooks {
}

trait CatalogHooks extends ClientHooks {
  def showCatalog(itemId: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]
}

trait ItemHooks extends HasContext {

  def load(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def saveProfile(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
  def saveSupportingMaterials(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
  def saveComponents(itemId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
  def saveXhtml(itemId: String, xhtml: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]
  def saveSummaryFeedback(itemId: String, feedback: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[StatusMessage, String]]
}

trait SessionHooks extends HasContext {

  def loadItemAndSession(sessionId: String)(implicit header: RequestHeader): Either[StatusMessage, FullSession]

  def loadOutcome(id: String)(implicit header: RequestHeader): Either[StatusMessage, SessionOutcome]

  def getScore(id: String)(implicit header: RequestHeader): Either[StatusMessage, SessionOutcome]

  def load(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]]

  def save(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, SaveSession]]
}

trait PlayerLauncherHooks extends HasContext {
  def playerJs(implicit header: RequestHeader): Future[PlayerJs]

  def editorJs(implicit header: RequestHeader): Future[PlayerJs]

  def catalogJs(implicit header: RequestHeader): Future[PlayerJs]
}

trait AssetHooks extends HasContext {
  def delete(itemId: String, file: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]

  /**
   * TODO: it would be preferable to have a signature as follows
   * {{{
   * def upload(itemId: String, file: String)(implicit header: RequestHeader): Future[Option[StatusMessage]]
   * }}}
   */
  def uploadAction(itemId: String, file: String)(block: Request[Int] => SimpleResult): Action[Int]
}

trait DataQueryHooks extends HasContext {
  def list(topic: String, query: Option[String] = None)(implicit header: RequestHeader): Future[Either[StatusMessage, JsArray]]

  def findOne(topic: String, id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, Option[JsValue]]]
}
