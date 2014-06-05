package org.corespring.container.components.loader

import play.api.libs.json.{ JsObject, JsValue }
import org.corespring.container.components.model.LibraryId

private[loader] trait PackageJsonReading {

  def loadLibraries(packageJson: JsValue): Seq[LibraryId] = {
    (packageJson \ "libraries").asOpt[Seq[JsObject]].map {
      seq =>
        seq.map {
          o =>
            val organization = (o \ "organization").asOpt[String]
            val name = (o \ "name").asOpt[String]
            val scope = (o \ "scope").asOpt[String]
            assert(organization.isDefined)
            assert(name.isDefined)
            LibraryId(organization.get, name.get, scope)
        }
    }.getOrElse(Seq.empty)
  }
}
