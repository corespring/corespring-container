package org.corespring.shell.controllers.catalog.actions

import org.corespring.container.client.controllers.{ AssetType, Assets }
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.shell.services.ItemService

import scala.concurrent.Future

import org.corespring.container.client.hooks.{ CatalogHooks => ContainerCatalogHooks }
import org.corespring.mongo.json.services.MongoService
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.JsValue
import play.api.mvc._
import scalaz.Validation
import scalaz.Scalaz._

class CatalogHooks(
  itemService: ItemService,
  assets: Assets,
  val containerContext: ContainerExecutionContext) extends ContainerCatalogHooks {

  lazy val logger = ContainerLogger.getLogger("CatalogHooks")

  override def load(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future {
    val item: Validation[String, JsValue] = for {
      i <- itemService.load(id).toSuccess(s"can't load item with id: $id")
    } yield {
      i
    }
    item.leftMap(s => (500, s)).toEither
  }
  override def showCatalog(itemId: String)(implicit header: RequestHeader): Future[Option[(Int, String)]] = Future(None)

  override def loadFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult = assets.load(AssetType.Item, id, path)(request)

}
