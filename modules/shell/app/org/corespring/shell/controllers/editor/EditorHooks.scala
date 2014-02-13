package org.corespring.shell.controllers.editor

import org.corespring.container.client.controllers.hooks.{EditorHooks => ContainerEditorHooks}
import org.corespring.mongo.json.services.MongoService
import play.api.libs.json.Json
import scala.concurrent.ExecutionContext


trait EditorHooks extends ContainerEditorHooks {

  def itemService: MongoService


}
