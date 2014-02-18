package org.corespring.container.client.component

import org.corespring.container.components.model._

trait DependencyResolver extends ComponentSplitter {

  /** returns a list of all components used including libraries */
  def resolveComponents(types: Seq[Id], scope: String): Seq[Component] = {

    def withinScope(id: LibraryId) = id.scope.map(_ == scope).getOrElse(true)
    def compMatchesTag(c: Component) = types.exists(id => id.org == c.id.org && id.name == c.id.name)

    val uiComps = uiComponents.filter(compMatchesTag)
    val libraryIds = uiComps.map(_.libraries).flatten.distinct.filter(withinScope)
    val libs = libraries.filter(l => libraryIds.exists(l.id.matches(_)))
    val layoutComps = layoutComponents.filter(compMatchesTag)
    (libs ++ uiComps ++ layoutComps).distinct
  }
}
