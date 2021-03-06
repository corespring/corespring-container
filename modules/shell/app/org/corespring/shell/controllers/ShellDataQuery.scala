package org.corespring.shell.controllers

import org.corespring.container.client.integration.ContainerExecutionContext
import play.api.Logger

import scala.concurrent.Future

import org.corespring.container.client.hooks.{ DataQueryHooks => ContainerDataQueryHooks }
import org.corespring.shell.controllers.data._
import play.api.libs.json._
import play.api.mvc.RequestHeader

class ShellDataQueryHooks(
                           val containerContext:ContainerExecutionContext
                         ) extends ContainerDataQueryHooks {

  private lazy val logger = Logger(classOf[ShellDataQueryHooks])

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

  lazy val standardClusters = uniqueClustersFrom(standards)

  lazy val standards: Seq[JsObject] = addDomain(StandardsJson())

  lazy val standardsTree: Seq[JsObject] = StandardsTreeJson()

  override def list(topic: String, query: Option[String])(implicit header: RequestHeader): Future[Either[(Int, String), JsArray]] = Future {
    logger.debug(s"list topic <$topic> query <$query>")

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
      case "standardClusters" => Json.toJson(standardClusters)
      case "standards" => Json.toJson(StandardsDataQuery.list(standards, query))
      case "standardsTree" => Json.toJson(standardsTree)
      case "subjects.primary" => Json.toJson(StandardsDataQuery.list(subjects, query))
      case "subjects.related" => Json.toJson(StandardsDataQuery.list(subjects, query))
    }
    Right(out.as[JsArray])
  }

  private def uniqueClustersFrom(standards: Seq[JsObject]) = {
    standards
      .map(s => (
        (s \ "domain").asOpt[String],
        (s \ "subject").asOpt[String]))
      .toMap
      .toSeq
      .map(p => Json.obj(
        "subject" -> p._2,
        "domain" -> p._1))
  }

  private def addDomain(standards: Seq[JsObject]) = {

    def getCluster(standard: JsValue, property: String) = {
      (standard \ property).asOpt[String] match {
        case Some(s) => Json.obj("domain" -> s)
        case _ => Json.obj("domain" -> "")
      }
    }

    standards.map(s => {
      (s \ "subject").asOpt[String] match {
        case Some("ELA") => s.as[JsObject] ++ getCluster(s, "subCategory")
        case Some("ELA-Literacy") => s.as[JsObject] ++ getCluster(s, "subCategory")
        case Some("Math") => s.as[JsObject] ++ getCluster(s, "category")
        case _ => s
      }
    })
  }

  override def findOne(topic: String, id: String)(implicit header: RequestHeader): Future[Either[(Int, String), Option[JsValue]]] = Future {

    def filter(o: JsObject) = (o \ "id").asOpt[String].map(_ == id).getOrElse(false)

    val out = topic match {
      case "subjects.primary" => subjects.filter(filter).headOption.map(Json.toJson(_)).getOrElse(JsObject(Seq()))
      case "subjects.related" => subjects.filter(filter).headOption.map(Json.toJson(_)).getOrElse(JsObject(Seq()))
      case _ => JsObject(Seq())
    }
    Right(Some(out))
  }

}