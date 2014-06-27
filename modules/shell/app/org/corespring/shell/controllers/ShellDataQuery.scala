package org.corespring.shell.controllers

import scala.concurrent.Future

import org.corespring.container.client.hooks.{DataQueryHooks => ContainerDataQueryHooks}
import org.corespring.shell.controllers.data._
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.RequestHeader

trait ShellDataQueryHooks extends ContainerDataQueryHooks {

  lazy val logger = Logger("shell.home")

  lazy val fieldValueJson: JsValue = FieldValueJson()

  lazy val bloomsTaxonomy: Seq[JsValue] = (fieldValueJson \ "bloomsTaxonomy").as[Seq[JsValue]]

  lazy val credentials: Seq[JsValue] = (fieldValueJson \ "credentials").as[Seq[JsValue]]

  lazy val depthOfKnowledge: Seq[JsValue] = (fieldValueJson \ "depthOfKnowledge").as[Seq[JsValue]]

  lazy val gradeLevels: Seq[JsValue] = (fieldValueJson \ "gradeLevels").as[Seq[JsValue]]

  lazy val itemTypes = fieldValueJson \ "itemTypes"

  lazy val keySkills: Seq[JsValue] = (fieldValueJson \ "keySkills").as[Seq[JsValue]]

  lazy val licenseTypes: Seq[JsValue] = (fieldValueJson \ "licenseTypes").as[Seq[JsValue]]

  lazy val mediaType: Seq[JsValue] = (fieldValueJson \ "mediaType").as[Seq[JsValue]]

  lazy val priorUses: Seq[JsValue] = (fieldValueJson \ "priorUses").as[Seq[JsValue]]

  lazy val reviewsPassed: Seq[JsValue] = (fieldValueJson \ "reviewsPassed").as[Seq[JsValue]]

  lazy val subjects: Seq[JsObject] = SubjectJson()

  lazy val standards: Seq[JsObject] = StandardsJson()

  lazy val standardsTree: Seq[JsObject] = StandardsTreeJson()



  override def list(topic: String, query: Option[String])(implicit header: RequestHeader): Future[Either[(Int, String), JsArray]] = Future{
    logger.debug(s"list topic <$topic> query <$query>")

    def filterSubjects(s: JsObject) = query.map {
      q => (s \ "subject").asOpt[String].map(s => s.toLowerCase().contains(q.toLowerCase)).getOrElse(true)
    }.getOrElse(true)

    val out = topic match {
      case "bloomsTaxonomy" => Json.toJson(bloomsTaxonomy)
      case "credentials" => Json.toJson(credentials)
      case "depthOfKnowledge" => Json.toJson(depthOfKnowledge)
      case "gradeLevels" => Json.toJson(gradeLevels)
      case "itemTypes" => itemTypes
      case "keySkills" => Json.toJson(keySkills)
      case "licenseTypes" => Json.toJson(licenseTypes)
      case "mediaType" => Json.toJson(mediaType)
      case "priorUses" => Json.toJson(priorUses)
      case "reviewsPassed" => Json.toJson(reviewsPassed)
      case "standards" => Json.toJson(StandardsDataQuery.list(standards, query))
      case "standardsTree" => Json.toJson(standardsTree)
      case "subjects.primary" => Json.toJson(subjects.filter(filterSubjects))
      case "subjects.related" => Json.toJson(subjects.filter(filterSubjects))
    }
    Right(out.as[JsArray])
  }

  override def findOne(topic: String, id: String)(implicit header: RequestHeader): Future[Either[(Int, String), Option[JsValue]]] = Future{

    def filter(o: JsObject) = (o \ "id").asOpt[String].map(_ == id).getOrElse(false)

    val out = topic match {
      case "subjects.primary" => subjects.filter(filter).headOption.map(Json.toJson(_)).getOrElse(JsObject(Seq()))
      case "subjects.related" => subjects.filter(filter).headOption.map(Json.toJson(_)).getOrElse(JsObject(Seq()))
      case _ => JsObject(Seq())
    }
    Right(Some(out))
  }

}