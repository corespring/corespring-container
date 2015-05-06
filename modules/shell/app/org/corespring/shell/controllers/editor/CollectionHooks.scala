package org.corespring.shell.controllers.editor

import org.corespring.container.client.hooks.{CollectionHooks => ContainerCollectionHooks, DataQueryHooks => ContainerDataQueryHooks}
import play.api.libs.json._
import play.api.mvc.RequestHeader

import scala.concurrent.Future

trait CollectionHooks extends ContainerCollectionHooks {

  override def list()(implicit header: RequestHeader): Future[Either[(Int, String), JsArray]] = Future {

    val out = Json.arr(
      Json.obj(
        "value" -> "Default",
        "key" -> 1),
      Json.obj(
        "value" -> "Collection One",
        "key" -> 2),
      Json.obj(
        "value" -> "Collection Two",
        "key" -> 3),
      Json.obj(
        "value" -> "Collection Three",
        "key" -> 4)
    )
    Right(out)
  }

}