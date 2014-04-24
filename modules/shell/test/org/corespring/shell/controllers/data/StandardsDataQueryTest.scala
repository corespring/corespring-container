package org.corespring.shell.controllers.data

import org.specs2.mutable.Specification
import play.api.libs.json.{Json, JsObject}


class StandardsDataQueryTest extends Specification {

  val sut = StandardsDataQuery

  "list" should {
    "return all standards if query is empty" in {
      val standards: Seq[JsObject] = List(
        Json.obj("category" -> "Reading")
      )
      val result = sut.list(standards, None)
      result.length === standards.length
    }

    "return all standards that contain searchTerm in fields" in {
      val standards: Seq[JsObject] = List(
        Json.obj("category" -> "Reading"),
        Json.obj("category" -> "Writing"),
        Json.obj("category" -> "Speaking")
      )
      val result = sut.list(standards, Some(Json.obj(
        "searchTerm" -> "Reading",
        "fields" -> Json.arr("category")
      ).toString()))
      result.length === 1
    }

    "return all standards that exactly match the filters" in {
      val standards: Seq[JsObject] = List(
        Json.obj("category" -> "Reading"),
        Json.obj("category" -> "Reading"),
        Json.obj("category" -> "Reading and Speaking")
      )
      val result = sut.list(standards, Some(Json.obj(
        "filters" -> Json.arr(Json.obj("field" -> "category", "value" -> "Reading"))
      ).toString()))
      result.length === 2
    }

    "return standards that match the filters and contain the searchTerm" in {
      val standards: Seq[JsObject] = List(
        Json.obj("id" -> "1", "category" -> "Reading", "subCategory" -> "sub one"),
        Json.obj("id" -> "2", "category" -> "Reading", "subCategory" -> "sub two"),
        Json.obj("id" -> "3", "category" -> "Reading and Speaking", "subCategory" -> "sub two")
      )
      val result = sut.list(standards, Some(Json.obj(
        "searchTerm" -> "two",
        "fields" -> Json.arr("subCategory"),
        "filters" -> Json.arr(Json.obj("field" -> "category", "value" -> "Reading"))
      ).toString()))
      result.length === 1
      (result.head \ "id").as[String] === "2"
    }

  }

}
