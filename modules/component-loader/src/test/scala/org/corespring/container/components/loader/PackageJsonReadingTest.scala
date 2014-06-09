package org.corespring.container.components.loader

import org.corespring.container.components.model.Id
import org.specs2.mutable.Specification
import play.api.libs.json.Json

class PackageJsonReadingTest extends Specification {

  val reader = new PackageJsonReading {}

  "PackageJsonReading" should {

    "read empty json" in {
      val result = reader.loadLibraries(Json.obj())
      result === Seq.empty
    }

    "read json" in {
      val result = reader.loadLibraries(Json.obj(
        "libraries" -> Json.arr(
          Json.obj("organization" -> "org", "name" -> "name"),
          Json.obj("organization" -> "org-2", "name" -> "name-2", "scope" -> "editor"))))
      result === Seq(
        Id("org", "name", None),
        Id("org-2", "name-2", Some("editor")))
    }
  }

}
