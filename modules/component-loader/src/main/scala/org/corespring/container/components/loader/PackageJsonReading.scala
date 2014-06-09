package org.corespring.container.components.loader

import org.corespring.container.components.model.Id
import play.api.libs.json.{ JsObject, JsValue }

private[loader] trait PackageJsonReading {

  def loadLibraries(packageJson: JsValue): Seq[Id] = {
    (packageJson \ "libraries").asOpt[Seq[JsObject]].map {
      seq =>
        seq.map {
          o =>
            val organization = (o \ "organization").asOpt[String]
            val name = (o \ "name").asOpt[String]
            val scope = (o \ "scope").asOpt[String]
            assert(organization.isDefined)
            assert(name.isDefined)
            Id(organization.get, name.get, scope)
        }
    }.getOrElse(Seq.empty)
  }
}
