package org.corespring.shell.controllers.catalog.actions

import org.corespring.container.client.hooks.{ CatalogHooks => ContainerCatalogHooks }
import org.corespring.mongo.json.services.MongoService
import play.api.Logger
import play.api.libs.json.JsValue
import play.api.mvc._

import scala.concurrent.Future
import scalaz.Scalaz._
import scalaz.Validation

trait CatalogHooks extends ContainerCatalogHooks {

  import scala.concurrent.ExecutionContext.Implicits.global

  lazy val logger = Logger("catalog.hooks.action.builder")

  def itemService: MongoService

  private def load(itemId: String)(implicit header: RequestHeader) = Future {
    val item: Validation[String, JsValue] = for {
      i <- itemService.load(itemId).toSuccess(s"can't load item with id: $itemId")
    } yield {
      i
    }
    item.leftMap(s => (500, s)).toEither
  }

  override def loadComponents(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = load(id)

  override def loadServices(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = load(id)

  override def loadConfig(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = load(id)

  override def showCatalog(itemId: String)(implicit header: RequestHeader): Future[Option[(Int, String)]] = Future(None)

}
