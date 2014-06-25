package org.corespring.container.client.controllers

import org.corespring.container.client.HasContext

import scala.concurrent.{ ExecutionContext, Future }

import org.corespring.container.client.hooks.DataQueryHooks
import play.api.libs.json.Json
import play.api.mvc.{ Action, AnyContent, Controller }

object DataQuery {
  val findTopics = Seq(
    "subjects.primary",
    "subjects.related")
  val listTopics = Seq(
    "bloomsTaxonomy",
    "credentials",
    "depthOfKnowledge",
    "gradeLevel",
    "itemType",
    "keySkills",
    "licenseTypes",
    "mediaType",
    "priorUses",
    "reviewsPassed",
    "standards",
    "standardsTree") ++ findTopics
}

/** Query service for static data, eg: subject, gradelevel, etc */
trait DataQuery extends Controller with HasContext {

  import org.corespring.container.client.controllers.DataQuery._

  def hooks: DataQueryHooks

  implicit def ec: ExecutionContext

  /** list all that match the query - if there's no query list all */
  def list(topic: String, query: Option[String] = None): Action[AnyContent] = Action.async { implicit request =>

    if (listTopics.contains(topic)) {
      hooks.list(topic, query).map {
        case Left((code, msg)) => Status(code)(Json.obj("error" -> msg))
        case Right(arr) => Ok(arr)
      }
    } else {
      Future(BadRequest(Json.obj("error" -> s"$topic is not a valid topic from: ${listTopics.mkString(",")}")))
    }
  }

  def findOne(topic: String, id: String): Action[AnyContent] = Action.async {
    implicit request =>
      if (findTopics.contains(topic)) {
        hooks.findOne(topic, id).map {
          case Left((code, msg)) => Status(code)(Json.obj("error" -> msg))
          case Right(maybeData) => Ok(maybeData.getOrElse(Json.obj()))
        }
      } else {
        Future(BadRequest(Json.obj("error" -> s"$topic is not a valid topic from: ${findTopics.mkString(",")}")))
      }
      Future(Ok(""))
  }

}
