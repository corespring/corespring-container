package org.corespring.shell.controllers.catalog.actions

import org.corespring.container.client.controllers.{AssetType, Assets}
import org.corespring.container.client.hooks.Hooks.{LoadResult, StatusMessage}
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.shell.services.ItemService

import scala.concurrent.Future
import org.corespring.container.client.hooks.{CatalogHooks => ContainerCatalogHooks}
import org.corespring.mongo.json.services.MongoService
import org.corespring.container.logging.ContainerLogger
import org.corespring.shell.DefaultPlayerSkin
import play.api.libs.json.{JsObject, JsValue, Json}
import play.api.mvc._

import scalaz.Validation
import scalaz.Scalaz._

class CatalogHooks(
itemService: ItemService,
assets: Assets,
                    val containerContext: ContainerExecutionContext
                  ) extends ContainerCatalogHooks {

  lazy val logger = ContainerLogger.getLogger("CatalogHooks")


  override def load(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), LoadResult]] = Future {
    val item: Validation[String, JsValue] = for {
      i <- itemService.load(id).toSuccess(s"can't load item with id: $id")
    } yield {
      i
    }
    item.leftMap(s => (500, s)).rightMap(i => (i, DefaultPlayerSkin.defaultPlayerSkin)).toEither
  }


  override def showCatalog(itemId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = Future(Right(DefaultPlayerSkin.defaultPlayerSkin))

  override def loadFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult = assets.load(AssetType.Item, id, path)(request)

}
