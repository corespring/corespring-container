package org.corespring.shell.controllers.catalog.actions

import scala.concurrent.Future

import org.corespring.container.client.hooks.{ CatalogHooks => ContainerCatalogHooks }
import org.corespring.mongo.json.services.MongoService
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.JsValue
import play.api.mvc._
import scalaz.Validation
import scalaz.Scalaz._

trait CatalogHooks extends ContainerCatalogHooks {

  lazy val logger = ContainerLogger.getLogger("CatalogHooks")

  def itemService: MongoService

  private def load(itemId: String)(implicit header: RequestHeader) = Future {
    val item: Validation[String, JsValue] = for {
      i <- itemService.load(itemId).toSuccess(s"can't load item with id: $itemId")
    } yield {
      i
    }
    item.leftMap(s => (500, s)).toEither
  }
  override def showCatalog(itemId: String)(implicit header: RequestHeader): Future[Option[(Int, String)]] = Future(None)

  override def loadItem(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = load(id)
}
