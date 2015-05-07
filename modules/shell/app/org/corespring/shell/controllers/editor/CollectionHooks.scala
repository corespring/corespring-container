package org.corespring.shell.controllers.editor

import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks.{CollectionHooks => ContainerCollectionHooks, DataQueryHooks => ContainerDataQueryHooks}
import play.api.libs.json._
import play.api.mvc.RequestHeader

import scala.concurrent.Future

trait CollectionHooks extends ContainerCollectionHooks {

  override def list()(implicit header: RequestHeader): Future[Either[StatusMessage, JsArray]] = Future {

    val out = Json.arr(
      Json.obj(
        "value" -> "default",
        "key" -> "col-0"),
      Json.obj(
        "value" -> "Collection One",
        "key" -> "col-1"),
      Json.obj(
        "value" -> "Collection Two",
        "key" -> "col-2"),
      Json.obj(
        "value" -> "Collection Three",
        "key" -> "col-3")
    )
    Right(out)
  }

}