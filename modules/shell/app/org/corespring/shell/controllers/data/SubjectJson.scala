package org.corespring.shell.controllers.data

import play.api.libs.json.{JsObject, JsValue, Json}

object SubjectJson {

  def apply(): Seq[JsObject] = value

  val value = Seq(
    Json.obj(
      "id" -> "4ffb535f6bb41e469c0bf2a7",
      "subject" -> "",
      "category" -> "Art"
    ),
    Json.obj(
      "id" -> "4ffb535f6bb41e469c0bf2a8",
      "subject" -> "Performing Arts",
      "category" -> "Art"
    ),
    Json.obj(
      "id" -> "4ffb535f6bb41e469c0bf2a9",
      "subject" -> "AP Music Theory,Visual Arts",
      "category" -> "Art"
    ),
    Json.obj(
      "id" -> "4ffb535f6bb41e469c0bf2aa",
      "subject" -> "AP Art History",
      "category" -> "Art"
    ),
    Json.obj(
      "id" -> "4ffb535f6bb41e469c0bf2ab",
      "subject" -> "Other",
      "category" -> "Art"
    ),
    Json.obj(
      "id" -> "4ffb535f6bb41e469c0bf2ac",
      "subject" -> "",
      "category" -> "English Language Arts"
    ),
    Json.obj(
      "id" -> "4ffb535f6bb41e469c0bf2ad",
      "subject" -> "English Language Arts",
      "category" -> "English Language Arts"
    ),
    Json.obj(
      "id" -> "4ffb535f6bb41e469c0bf2ae",
      "subject" -> "AP English Literature",
      "category" -> "English Language Arts"
    ),
    Json.obj(
      "id" -> "4ffb535f6bb41e469c0bf2af",
      "subject" -> "Writing",
      "category" -> "English Language Arts"
    )
  )



}
