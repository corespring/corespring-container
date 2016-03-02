package org.corespring.shell.controllers.editor

import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks.{ ItemMetadataHooks => ContainerItemMetadataHooks }
import org.corespring.container.client.integration.ContainerExecutionContext
import play.api.libs.json._
import play.api.mvc.RequestHeader

import scala.concurrent.Future

class ItemMetadataHooks(
  val containerContext: ContainerExecutionContext) extends ContainerItemMetadataHooks {

  override def get(id: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = Future {

    val out = Json.parse(
      """
        | [{
        |    "editorLabel" : "New Classrooms",
        |    "editorUrl" : "http://metadata-form-ui-v2.herokuapp.com/newclassrooms",
        |    "isPublic" : false,
        |    "metadataKey" : "new_classrooms",
        |    "schema" : [
        |        {
        |            "key" : "skillNumber"
        |        },
        |        {
        |            "key" : "family"
        |        },
        |        {
        |            "key" : "masterQuestion"
        |        },
        |        {
        |            "key" : "credits"
        |        }
        |    ]
        |}]
      """.stripMargin)
    Right(out)
  }

}