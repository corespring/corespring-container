package org.corespring.container.client.component

import org.corespring.container.components.model._
import com.ahum.TopologicalSorter

trait DependencyResolver extends ComponentSplitter {

  /** returns a list of all components used including libraries */
  def resolveComponents(types: Seq[Id], scope: String): Seq[Component] = {

    def withinScope(id: LibraryId) = id.scope.map(_ == scope).getOrElse(true)
    def compMatchesTag(c: Component) = types.exists(id => id.org == c.id.org && id.name == c.id.name)

    val uiComps = uiComponents.filter(compMatchesTag)
    val uiLibraryIds = uiComps.map(_.libraries).flatten
    val libLibraryIds = libraries.map(_.libraries).flatten
    val libraryIds = (uiLibraryIds ++ libLibraryIds).distinct.filter(withinScope)
    val topSortedLibraryIds = topSort(libraryIds)
    //do a topological sort on the library ids so that dependencies are loaded
    //in the correct order
    //1 -> Seq(2,3)
    val libs = libraries.filter(l => topSortedLibraryIds.exists(l.id.matches(_)))
    val layoutComps = layoutComponents.filter(compMatchesTag)
    (libs ++ uiComps ++ layoutComps).distinct
  }

  type OrgName = (String, String)

  def topSort(ids: Seq[LibraryId]): Seq[LibraryId] = {
    val libs: Seq[Library] = ids.map(id => libraries.find(_.id.matches(id))).flatten
    def toNode(l: Library): (OrgName, Seq[OrgName]) = ((l.id.org, l.id.name) -> l.libraries.map(i => (i.org, i.name)))
    val libNodes: Seq[(OrgName, Seq[OrgName])] = libs.map(toNode)
    val topsorted: Seq[(OrgName, Seq[OrgName])] = TopologicalSorter.sort(libNodes: _*)
    def orgNameToLibraryId(on: OrgName): Option[LibraryId] = ids.find(i => i.org == on._1 && i.name == on._2)
    topsorted.map(_._1).map(orgNameToLibraryId).flatten
  }
}
