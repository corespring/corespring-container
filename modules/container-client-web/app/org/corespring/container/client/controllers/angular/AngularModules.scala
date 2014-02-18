package org.corespring.container.client.controllers.angular

import org.corespring.container.client.controllers.helpers.NameHelper
import org.corespring.container.components.model.packaging.ClientSideDependency
import org.corespring.container.components.model.{Component, Id}

class AngularModules(defaultModules : String*) extends NameHelper {
  def createAngularModules(components:Seq[Component], clientSideDependencies: Seq[ClientSideDependency]) : Seq[String] = {
    val compModules : Seq[String] = components.map(c => idToModuleName(c.id))
    val dependencyModules : Seq[String] = clientSideDependencies.flatMap(_.angularModule)
    (defaultModules ++ compModules ++ dependencyModules).sorted.distinct
  }

  protected def idToModuleName(id: Id): String = moduleName(id.org, id.name)
}


