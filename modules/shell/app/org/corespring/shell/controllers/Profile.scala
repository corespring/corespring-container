package org.corespring.shell.controllers

import org.corespring.container.client.controllers.{ Profile => ContainerProfile }
import play.api.libs.json.{ JsObject, Json, JsArray }
import play.api.mvc.{ AnyContent, Action }

class Profile extends ContainerProfile {

  val subjectString =
    """
      |[
      |   {
      |      "_id":{
      |         "$oid":"4ffb535f6bb41e469c0bf2a7"
      |      },
      |      "subject":"",
      |      "category":"Art"
      |   },
      |   {
      |      "_id":{
      |         "$oid":"4ffb535f6bb41e469c0bf2a8"
      |      },
      |      "subject":"Performing Arts",
      |      "category":"Art"
      |   },
      |   {
      |      "_id":{
      |         "$oid":"4ffb535f6bb41e469c0bf2a9"
      |      },
      |      "subject":"AP Music Theory,Visual Arts",
      |      "category":"Art"
      |   },
      |   {
      |      "_id":{
      |         "$oid":"4ffb535f6bb41e469c0bf2aa"
      |      },
      |      "subject":"AP Art History",
      |      "category":"Art"
      |   },
      |   {
      |      "_id":{
      |         "$oid":"4ffb535f6bb41e469c0bf2ab"
      |      },
      |      "subject":"Other",
      |      "category":"Art"
      |   },
      |   {
      |      "_id":{
      |         "$oid":"4ffb535f6bb41e469c0bf2ac"
      |      },
      |      "subject":"",
      |      "category":"English Language Arts"
      |   },
      |   {
      |      "_id":{
      |         "$oid":"4ffb535f6bb41e469c0bf2ad"
      |      },
      |      "subject":"English Language Arts",
      |      "category":"English Language Arts"
      |   },
      |   {
      |      "_id":{
      |         "$oid":"4ffb535f6bb41e469c0bf2ae"
      |      },
      |      "subject":"AP English Literature",
      |      "category":"English Language Arts"
      |   },
      |   {
      |      "_id":{
      |         "$oid":"4ffb535f6bb41e469c0bf2af"
      |      },
      |      "subject":"Writing",
      |      "category":"English Language Arts"
      |   }
      |]
    """.stripMargin

  val itemTypesString =
    """
      |[
      |  {
      |    "key": "Fixed Choice",
      |    "value": [
      |      "Multiple Choice",
      |      "Multi-Multi Choice",
      |      "Visual Multi Choice",
      |      "Inline Choice",
      |      "Ordering",
      |      "Drag & Drop"
      |    ]
      |  },
      |  {
      |    "key": "Constructed Response",
      |    "value": [
      |      "Constructed Response - Short Answer",
      |      "Constructed Response - Open Ended"
      |    ]
      |  },
      |  {
      |    "key": "Evidence",
      |    "value": [
      |      "Select Evidence in Text",
      |      "Document Based Question",
      |      "Passage With Questions"
      |    ]
      |  },
      |  {
      |    "key": "Composite",
      |    "value": [
      |      "Composite - Multiple MC",
      |      "Composite - MC and SA",
      |      "Composite - MC, SA, OE",
      |      "Composite - Project",
      |      "Composite - Performance",
      |      "Composite - Activity",
      |      "Composite - Algebra"
      |    ]
      |  },
      |  {
      |    "key": "Algebra",
      |    "value": [
      |      "Plot Lines",
      |      "Plot Points",
      |      "Evaluate an Equation"
      |    ]
      |  }
      |]
    """.stripMargin

  lazy val itemTypes = Json.parse(itemTypesString)

  lazy val gradeLevels: Seq[String] = Seq("PK", "KG", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "PS", "AP", "UG")

  lazy val subjects = Json.parse(subjectString).as[Seq[JsObject]]

  override def list(topic: String, query: Option[String]): Action[AnyContent] = Action {

    def filter(s: JsObject) = query.map { q => (s \ "subject").asOpt[String].map(s => s.contains(q)).getOrElse(true) }.getOrElse(true)
    val out = topic match {
      case "primarySubject" => Json.toJson(subjects.filter(filter))
      case "relatedSubject" => Json.toJson(subjects.filter(filter))
      case "gradeLevel" => Json.toJson(gradeLevels)
      case "itemType" => itemTypes
    }
    Ok(out)
  }

  override def findOne(topic: String, id: String): Action[AnyContent] = Action{ request =>

    def filter(o: JsObject) = (o \ "_id" \ "$oid").asOpt[String].map( _ == id).getOrElse(false)

    val out = topic match {
      case "primarySubject" => subjects.filter(filter).headOption.map(Json.toJson(_)).getOrElse(JsObject(Seq()))
      case "relatedSubject" => subjects.filter(filter).headOption.map(Json.toJson(_)).getOrElse(JsObject(Seq()))
      case _ => JsObject(Seq())
    }
    Ok(out)
  }
}
