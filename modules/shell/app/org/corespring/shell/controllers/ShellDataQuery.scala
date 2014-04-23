package org.corespring.shell.controllers

import org.corespring.container.client.controllers.{DataQuery => ContainerDataQuery}
import play.api.libs.json.{JsValue, JsObject, Json}
import play.api.mvc.{AnyContent, Action}
import org.corespring.shell.controllers.data._
import play.api.Logger
import play.api.libs.json.JsObject

class ShellDataQuery extends ContainerDataQuery {

  lazy val logger = Logger("shell.home")

  lazy val fieldValueJson: JsValue = FieldValueJson()

  lazy val bloomsTaxonomy: Seq[JsValue] = (fieldValueJson \ "bloomsTaxonomy").as[Seq[JsValue]]

  lazy val credentials: Seq[JsValue] = (fieldValueJson \ "credentials").as[Seq[JsValue]]

  lazy val depthOfKnowledge: Seq[JsValue] = (fieldValueJson \ "depthOfKnowledge").as[Seq[JsValue]]

  lazy val gradeLevels: Seq[JsValue] = (fieldValueJson \ "gradeLevels").as[Seq[JsValue]]

  lazy val itemTypes = fieldValueJson \ "itemTypes"

  lazy val keySkills: Seq[JsValue] = (fieldValueJson \ "keySkills").as[Seq[JsValue]]

  lazy val licenseTypes: Seq[JsValue] = (fieldValueJson \ "licenseTypes").as[Seq[JsValue]]

  lazy val priorUses: Seq[JsValue] = (fieldValueJson \ "priorUses").as[Seq[JsValue]]

  lazy val reviewsPassed: Seq[JsValue] = (fieldValueJson \ "reviewsPassed").as[Seq[JsValue]]

  lazy val subjects: Seq[JsObject] = SubjectJson()

  lazy val standards: Seq[JsObject] = StandardsJson()

  lazy val standardsTree: Seq[JsObject] = StandardsTreeJson()

  override def list(topic: String, query: Option[String]): Action[AnyContent] = Action {

    logger.debug(s"list topic <$topic> query <$query>")

    def filterSubjects(s: JsObject) = query.map {
      q => (s \ "subject").asOpt[String].map(s => s.contains(q)).getOrElse(true)
    }.getOrElse(true)



    val out = topic match {
      case "bloomsTaxonomy" => Json.toJson(bloomsTaxonomy)
      case "credentials" => Json.toJson(credentials)
      case "depthOfKnowledge" => Json.toJson(depthOfKnowledge)
      case "gradeLevel" => Json.toJson(gradeLevels)
      case "itemType" => itemTypes
      case "keySkills" => Json.toJson(keySkills)
      case "licenseTypes" => Json.toJson(licenseTypes)
      case "priorUses" => Json.toJson(priorUses)
      case "reviewsPassed" => Json.toJson(reviewsPassed)
      case "standards" => Json.toJson(StandardsDataQuery.list(standards, query))
      case "standardsTree" => Json.toJson(standardsTree)
      case "subjects.primary" => Json.toJson(subjects.filter(filterSubjects))
      case "subjects.related" => Json.toJson(subjects.filter(filterSubjects))
    }
    Ok(out)
  }

  override def findOne(topic: String, id: String): Action[AnyContent] = Action {
    request =>

      def filter(o: JsObject) = (o \ "id").asOpt[String].map(_ == id).getOrElse(false)

      val out = topic match {
        case "subjects.primary" => subjects.filter(filter).headOption.map(Json.toJson(_)).getOrElse(JsObject(Seq()))
        case "subjects.related" => subjects.filter(filter).headOption.map(Json.toJson(_)).getOrElse(JsObject(Seq()))
        case _ => JsObject(Seq())
      }
      Ok(out)
  }
}