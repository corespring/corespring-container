package org.corespring.shell.controllers.editor

import org.corespring.container.client.hooks.Hooks.R
import org.corespring.container.client.{ hooks => containerHooks }
import org.corespring.mongo.json.services.MongoService
import play.api.http.Status._
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.Future

trait ItemHooks
  extends containerHooks.CoreItemHooks
  with containerHooks.CreateItemHook
  with ItemHooksHelper {
  def itemService: MongoService

  def assets: ItemAssets

  override def load(itemId: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future {
    itemService.load(itemId).map { i =>
      Right(i)
    }.getOrElse(Left((NOT_FOUND, s"Can't find item with id: $itemId")))
  }

  override def delete(id: String)(implicit h: RequestHeader): R[JsValue] = Future {
    itemService.delete(id)
    assets.deleteItem(id)
    Right(Json.obj("id" -> id))
  }

  lazy val itemFineGrainedSave = fineGrainedSave(itemService, passThrough _) _

  override def saveXhtml(id: String, xhtml: String)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("xhtml" -> xhtml))
  }

  override def saveCollectionId(id: String, collectionId: String)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("collection" -> Json.obj("id" -> collectionId)))
  }

  override def saveSupportingMaterials(id: String, json: JsValue)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("supportingMaterials" -> addSupportingMaterialIds(json)))
  }

  override def saveCustomScoring(id: String, customScoring: String)(implicit header: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("customScoring" -> customScoring))
  }

  override def saveComponents(id: String, json: JsValue)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("components" -> json))
  }

  override def saveSummaryFeedback(id: String, feedback: String)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("summaryFeedback" -> feedback))
  }

  override def saveProfile(id: String, json: JsValue)(implicit h: RequestHeader): R[JsValue] = {
    itemFineGrainedSave(id, Json.obj("profile" -> json))
  }

  override def createItem(json: Option[JsValue])(implicit header: RequestHeader): R[String] = Future {
    val newItem = Json.obj(
      "components" -> Json.obj(),
      "profile" -> Json.obj("taskInfo" -> Json.obj("title" -> "Untitled")),
      "metadata" -> Json.obj(),
      "xhtml" -> "<div></div>")

    itemService.create(newItem).map {
      oid =>
        Right(oid.toString)
    }.getOrElse(Left(BAD_REQUEST -> "Error creating item"))
  }

}
