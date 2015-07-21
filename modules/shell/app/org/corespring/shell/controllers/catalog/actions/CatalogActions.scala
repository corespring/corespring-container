package org.corespring.shell.controllers.catalog.actions

import org.corespring.container.client.controllers.{ AssetType, Assets }

import scala.concurrent.Future

import org.corespring.container.client.hooks.{ CatalogHooks => ContainerCatalogHooks, LoadResponse }
import org.corespring.mongo.json.services.MongoService
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.JsValue
import play.api.mvc._
import scalaz.Validation
import scalaz.Scalaz._
import play.api.libs.json.{ JsValue, Json }

trait CatalogHooks extends ContainerCatalogHooks {

  lazy val logger = ContainerLogger.getLogger("CatalogHooks")

  def itemService: MongoService

  override def loadSupportingMaterialFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult = {
    loadFile(id, s"materials/$path")(request)
  }

  def assets: Assets

  override def load(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), LoadResponse]] = Future {
    val item: Validation[String, LoadResponse] = for {
      i <- itemService.load(id).toSuccess(s"can't load item with id: $id")
    } yield {
      LoadResponse(i, Json.obj())
    }
    item.leftMap(s => (500, s)).toEither
  }
  override def showCatalog(itemId: String)(implicit header: RequestHeader): Future[Option[(Int, String)]] = Future(None)

  override def loadFile(id: String, path: String)(request: Request[AnyContent]): SimpleResult = assets.load(AssetType.Item, id, path)(request)

}
