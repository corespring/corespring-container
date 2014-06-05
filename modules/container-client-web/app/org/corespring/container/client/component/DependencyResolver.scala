package org.corespring.container.client.component

import org.corespring.container.components.model._
import com.ahum.deps.{ DependencyLister, Branch, Leaf, Node }

trait DependencyResolver extends ComponentSplitter with LibraryUtils {

  /**
   * Returns a list of all components used including libraries.
   * UIComponents can depend on Libraries
   * Libraries can depend on other Libraries
   *
   * The libraries are topologically sorted so that dependencies load correctly.
   */
  def resolveComponents(types: Seq[Id], scope: String): Seq[Component] = {

    def withinScope(id: LibraryId) = id.scope.map(_ == scope).getOrElse(true)
    def compMatchesTag(c: Component) = types.exists(id => id.org == c.id.org && id.name == c.id.name)

    val uiComps = uiComponents.filter(compMatchesTag)
    val uiLibraryIds = uiComps.map(_.libraries).flatten
    val libLibraryIds = libraries.map(_.libraries).flatten
    val libraryIds = (uiLibraryIds ++ libLibraryIds).distinct.filter(withinScope)
    val libs = libraries.filter(l => libraryIds.exists(l.id.matches(_)))
    val topSortedLibs = topSort(libs)
    val layoutComps = layoutComponents.filter(compMatchesTag)
    (topSortedLibs ++ uiComps ++ layoutComps).distinct
  }

  def getLibById(id: Id): Option[Library] = libraries.find(_.id.matches(id))

  def resolveDependencyIds(uiComp: UiComponent, scope: Option[String] = None): Seq[Id] = {

    def toNode(id: Id): Node[Id] = {
      getLibById(id).map { l =>
        l.libraries match {
          case Nil => Leaf(id)
          case head :: rest => Branch(id, (head +: rest).foldRight[Seq[Node[Id]]](Seq()) { (id, acc) => acc :+ toNode(id) })
        }
      }.getOrElse(Leaf(id))
    }

    val root = Branch(uiComp.id, uiComp.libraries.map(toNode))
    DependencyLister.list(root)
  }

}
