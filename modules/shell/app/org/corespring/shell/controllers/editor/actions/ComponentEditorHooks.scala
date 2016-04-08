package org.corespring.shell.controllers.editor.actions

import org.corespring.container.client.controllers.{ AssetType, Assets }
import org.corespring.container.client.hooks.Hooks.{ ItemAndDefaults, StatusMessage }
import org.corespring.container.client.hooks.{ ComponentEditorHooks => ContainerComponentEditorHooks }
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.logging.ContainerLogger
import org.corespring.shell.DefaultPlayerSkin
import org.corespring.shell.services.ItemService
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._

import scala.concurrent.Future
import scalaz.Scalaz._
import scalaz.Validation

class ComponentEditorHooks(val containerContext: ContainerExecutionContext) extends ContainerComponentEditorHooks {

  lazy val logger = ContainerLogger.getLogger("ComponentEditorHooks")

  override def load(id: String)(implicit header: RequestHeader): Future[Either[(Int, String), ItemAndDefaults]] = Future {
    Right((Json.obj(), DefaultPlayerSkin.defaultPlayerSkin))
  }

}
