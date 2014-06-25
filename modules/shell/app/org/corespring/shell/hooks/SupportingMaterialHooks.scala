package org.corespring.shell.hooks

import org.corespring.container.client.hooks.NewSupportingMaterial
import org.corespring.container.client.{ hooks => containerHooks }
import play.api.mvc.RequestHeader
import play.api.http.Status._

import scala.concurrent.Future

trait SupportingMaterialHooks extends containerHooks.SupportingMaterialHooks {
  override def create(itemId: String)(implicit header: RequestHeader): Future[Either[(Int, String), NewSupportingMaterial]] = Future {

    Left((NOT_FOUND -> "todo"))
  }
}
