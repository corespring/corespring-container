package org.corespring.container.components.model.dependencies

import com.ahum.deps._
import org.corespring.container.components.model._
import org.slf4j.{ LoggerFactory, Logger }

trait DependencyResolver extends ComponentSplitter with LibraryUtils {

  type IdRelation = (Id, Seq[Id])

  private lazy val logger: Logger = LoggerFactory.getLogger("models.dependencies.DependencyResolver")

  lazy val relationships: Seq[(Id, Seq[Id])] = {
    components.map { c =>
      c match {
        case UiComponent(org, name, _, _, _, _, _, _, _, _, libs) => (Id(org, name) -> libs)
        case Library(org, name, _, _, _, _, libs) => (Id(org, name) -> libs)
        case LayoutComponent(org, name, _, _, _) => (Id(org, name) -> Seq.empty)
      }
    }
  }

  def resolveComponents(ids: Seq[Id], scope: Option[String] = None): Seq[Component] = {
    val sortedIds = resolveIds(ids, scope)
    val out = sortedIds.flatMap(id => components.find(c => c.id == id))
    out
  }

  /**
   * For a given set of ids, return a topologically sorted sequence of ids (plus their dependents).
   * @param ids
   * @return
   */
  def resolveIds(ids: Seq[Id], scope: Option[String] = None): Seq[Id] = {

    /**
     * Is id in scope - if the id has no scope it is thought to be in scope
     */
    def isInScope(scope: String)(id: Id): Boolean = {
      id.scope.map { ids =>
        ids == scope
      }.getOrElse(true)
    }

    /**
     * trim the dependency relationships of relationships that aren't in scope - in preparation for use in `innerResolve`
     */
    lazy val scopedRelationships: Seq[IdRelation] = {
      scope.map { s =>
        relationships.map { idr =>
          val (id, deps) = idr
          (id -> deps.filter(isInScope(s)))
        }
      }.getOrElse(relationships)
    }

    /**
     * For each id gather its relationship, and then do the same for any dependent ids that have been found
     * @param i
     * @param acc
     * @return
     */
    def innerResolve(i: Seq[Id], acc: Seq[(Id, Seq[Id])]): Seq[(Id, Seq[Id])] = {

      def addToAcc(otherIds: Seq[Id])(rel: IdRelation) = {
        val (_, deps) = rel
        val nonAccumulatedDeps = deps.filterNot(depId => acc.map(_._1).exists(id => id.orgNameMatch(depId)))
        val newAcc = if (acc.contains(rel)) acc else acc :+ rel
        val idsRemaining = (otherIds ++ nonAccumulatedDeps).distinct
        innerResolve(idsRemaining, newAcc)
      }

      i match {
        case Nil => {
          println("return the acc id is null")
          acc
        }
        case Seq(head) => {
          scopedRelationships
            .find(t => t._1.orgNameMatch(head))
            .map(addToAcc(Nil))
            .getOrElse(innerResolve(Nil, acc))
        }
        case head :: rest => {
          scopedRelationships
            .find(t => t._1.orgNameMatch(head))
            .map(addToAcc(rest))
            .getOrElse(innerResolve(rest, acc))
        }
      }
    }

    val relations = innerResolve(ids, Seq())

    type OrgName = (String, String)
    type OrgRelation = (OrgName, Seq[OrgName])

    def orgName(id: Id): OrgName = id.org -> id.name

    logger.trace(s"relations: $relations")

    //To simplify the topSort - we use string based tuples - the build the ids back up
    val orgNames: Seq[OrgRelation] = relations.map(t => orgName(t._1) -> t._2.map(orgName))
    val sortedRelations: Seq[OrgRelation] = TopologicalSorter.sort(orgNames: _*)
    val sortedIds = sortedRelations.map(r => Id(r._1._1, r._1._2))
    logger.trace(s"sortedIds -> $sortedIds")
    sortedIds.map(i => i.copy(scope = None)).distinct
  }

}
