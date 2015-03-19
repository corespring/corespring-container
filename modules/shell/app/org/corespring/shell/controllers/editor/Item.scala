package org.corespring.shell.controllers.editor

import org.bson.types.ObjectId
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks.{ItemDraftHooks => ContainerItemDraftHooks, ItemHooks => ContainerItemHooks}
import org.corespring.mongo.json.services.MongoService
import play.api.http.Status._
import play.api.libs.json._
import play.api.mvc._

import scala.concurrent.Future

trait ItemHooks extends ContainerItemHooks {
  def itemService: MongoService

  override def load(itemId: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = Future {
    itemService.load(itemId).map { i =>
      Right(i)
    }.getOrElse(Left((NOT_FOUND, s"Can't find item with id: $itemId")))
  }

  override def create(json: Option[JsValue])(implicit header: RequestHeader): Future[Either[StatusMessage, String]] = Future {
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

trait ItemDraftHooks extends ContainerItemDraftHooks {

  def draftItemService: MongoService

  def itemService: MongoService

  override def saveProfile(draftId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    fineGrainedSave(draftId, Json.obj("item.profile" -> json))

  override def saveXhtml(draftId: String, xhtml: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    fineGrainedSave(draftId, Json.obj("item.xhtml" -> xhtml))

  override def saveSummaryFeedback(draftId: String, fb: String)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    fineGrainedSave(draftId, Json.obj("item.summaryFeedback" -> fb))

  override def saveSupportingMaterials(draftId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = {
    def addSupportingMaterialIds(sm: JsValue): JsArray = sm match {
      case JsArray(o) => JsArray(o.map({
        case obj: JsObject => obj ++ Json.obj("id" -> ObjectId.get.toString)
        case other : JsValue => other
      }))
      case _ => JsArray(Seq.empty)
    }
    fineGrainedSave(draftId, Json.obj("item.supportingMaterials" -> addSupportingMaterialIds(json)))
  }

  override def saveComponents(draftId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] =
    fineGrainedSave(draftId, Json.obj("item.components" -> json))

  private def fineGrainedSave(draftId: String, json: JsValue)(implicit header: RequestHeader): Future[Either[(Int, String), JsValue]] = {
    Future {
      draftItemService.fineGrainedSave(draftId, json).map {
        json =>
          Right(json)
      }.getOrElse(Left(BAD_REQUEST -> "Error saving"))
    }
  }

  override def load(draftId: String)(implicit header: RequestHeader): Future[Either[StatusMessage, JsValue]] = {
    Future {
      draftItemService.load(draftId).map {
        Right(_)
      }.getOrElse(Left(NOT_FOUND -> ""))
    }
  }

  override def create(itemId: String)(implicit h: RequestHeader): R[String] = Future {
    {
      for{
        item <- itemService.load(itemId)
        draftId <- draftItemService.create(Json.obj("item" -> item))
      } yield Right(draftId.toString)
    }.getOrElse(Left(NOT_FOUND -> s"Can't find item by id: $itemId"))
  }

  override def delete(draftId: String)(implicit h: RequestHeader): R[JsValue] = Future {
    draftItemService.delete(draftId)
    Right(Json.obj("id" -> draftId))
  }

  override def commit(draftId: String)(implicit h: RequestHeader): R[JsValue] = Future {
    draftItemService.load(draftId).map { draft =>
      val item = (draft \ "item").as[JsObject]
      val itemId = (item \ "_id" \ "$oid").as[String]
      itemService.save(itemId, item)
      draftItemService.delete(draftId)
      Right(Json.obj("itemId" -> itemId, "draftId" -> draftId))
    }.getOrElse {
      Left((NOT_FOUND, s"Can't find draft by id: $draftId"))
    }
  }
}

