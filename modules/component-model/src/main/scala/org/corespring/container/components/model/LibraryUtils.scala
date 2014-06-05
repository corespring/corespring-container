package org.corespring.container.components.model

import com.ahum.deps.TopologicalSorter

trait LibraryUtils {

  type OrgName = (String, String)

  def topSort(libraries: Seq[Library]): Seq[Library] = {
    def toNode(l: Library): (OrgName, Seq[OrgName]) = ((l.id.org, l.id.name) -> l.libraries.map(i => (i.org, i.name)))
    val libNodes: Seq[(OrgName, Seq[OrgName])] = libraries.map(toNode)
    val sorted: Seq[(OrgName, Seq[OrgName])] = TopologicalSorter.sort(libNodes: _*)
    def orgNameToLibraryId(on: OrgName): Option[Library] = libraries.find(l => l.id.org == on._1 && l.id.name == on._2)
    sorted.map(_._1).map(orgNameToLibraryId).flatten
  }
}
