package org.corespring.shell.controllers

import org.corespring.container.client.controllers.{ DataQuery => ContainerDataQuery }
import play.api.libs.json.{ JsValue, JsObject, Json, JsArray }
import play.api.mvc.{ AnyContent, Action }

class ShellDataQuery extends ContainerDataQuery {

  lazy val fieldValueJson: JsValue = FieldValueJson()

  val subjectString =
    """
      |[
      |   {
      |      "id":"4ffb535f6bb41e469c0bf2a7",
      |      "subject":"",
      |      "category":"Art"
      |   },
      |   {
      |      "id":"4ffb535f6bb41e469c0bf2a8",
      |      "subject":"Performing Arts",
      |      "category":"Art"
      |   },
      |   {
      |      "id":"4ffb535f6bb41e469c0bf2a9",
      |      "subject":"AP Music Theory,Visual Arts",
      |      "category":"Art"
      |   },
      |   {
      |      "id":"4ffb535f6bb41e469c0bf2aa",
      |      "subject":"AP Art History",
      |      "category":"Art"
      |   },
      |   {
      |      "id":"4ffb535f6bb41e469c0bf2ab",
      |      "subject":"Other",
      |      "category":"Art"
      |   },
      |   {
      |      "id":"4ffb535f6bb41e469c0bf2ac",
      |      "subject":"",
      |      "category":"English Language Arts"
      |   },
      |   {
      |      "id":"4ffb535f6bb41e469c0bf2ad",
      |      "subject":"English Language Arts",
      |      "category":"English Language Arts"
      |   },
      |   {
      |      "id":"4ffb535f6bb41e469c0bf2ae",
      |      "subject":"AP English Literature",
      |      "category":"English Language Arts"
      |   },
      |   {
      |      "id":"4ffb535f6bb41e469c0bf2af",
      |      "subject":"Writing",
      |      "category":"English Language Arts"
      |   }
      |]
    """.stripMargin

  lazy val bloomsTaxonomy: Seq[JsValue] = (fieldValueJson \ "bloomsTaxonomy").as[Seq[JsValue]]

  lazy val credentials: Seq[JsValue] = (fieldValueJson \ "credentials").as[Seq[JsValue]]

  lazy val depthOfKnowledge: Seq[JsValue] = (fieldValueJson \ "depthOfKnowledge").as[Seq[JsValue]]

  lazy val gradeLevels: Seq[JsValue] = (fieldValueJson \ "gradeLevels").as[Seq[JsValue]]

  lazy val itemTypes = fieldValueJson \ "itemTypes"

  lazy val keySkills: Seq[JsValue] = (fieldValueJson \ "keySkills").as[Seq[JsValue]]

  lazy val licenseTypes: Seq[JsValue] = (fieldValueJson \ "licenseTypes").as[Seq[JsValue]]

  lazy val priorUses: Seq[JsValue] = (fieldValueJson \ "priorUses").as[Seq[JsValue]]

  lazy val reviewsPassed: Seq[JsValue] = (fieldValueJson \ "reviewsPassed").as[Seq[JsValue]]

  lazy val subjects = Json.parse(subjectString).as[Seq[JsObject]]

  override def list(topic: String, query: Option[String]): Action[AnyContent] = Action {

    def filter(s: JsObject) = query.map { q => (s \ "subject").asOpt[String].map(s => s.contains(q)).getOrElse(true) }.getOrElse(true)
    val out = topic match {
      case "bloomsTaxonomy" => Json.toJson(bloomsTaxonomy)
      case "credentials" => Json.toJson(credentials)
      case "depthOfKnowledge" => Json.toJson(depthOfKnowledge)
      case "gradeLevel" => Json.toJson(gradeLevels)
      case "itemType" => itemTypes
      case "keySkills" => Json.toJson(keySkills)
      case "licenseTypes" => Json.toJson(licenseTypes)
      case "primarySubject" => Json.toJson(subjects.filter(filter))
      case "priorUses" => Json.toJson(priorUses)
      case "relatedSubject" => Json.toJson(subjects.filter(filter))
      case "reviewsPassed" => Json.toJson(reviewsPassed)
    }
    Ok(out)
  }

  override def findOne(topic: String, id: String): Action[AnyContent] = Action { request =>

    def filter(o: JsObject) = (o \ "id").asOpt[String].map(_ == id).getOrElse(false)

    val out = topic match {
      case "primarySubject" => subjects.filter(filter).headOption.map(Json.toJson(_)).getOrElse(JsObject(Seq()))
      case "relatedSubject" => subjects.filter(filter).headOption.map(Json.toJson(_)).getOrElse(JsObject(Seq()))
      case _ => JsObject(Seq())
    }
    Ok(out)
  }
}
