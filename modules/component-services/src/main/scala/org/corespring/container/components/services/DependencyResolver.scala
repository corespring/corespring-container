package org.corespring.container.components.services

import com.ahum.deps._
import org.corespring.container.components.model._
import play.api.Logger

class DependencyResolver(componentService: ComponentService) {

  type IdRelation = (Id, Seq[Id])

  private lazy val logger = Logger(classOf[DependencyResolver])

  private def components = componentService.components

  lazy val relationships: Seq[(Id, Seq[Id])] = {
    components.map { c =>
      c match {
        case i: Interaction => (Id(i.org, i.name) -> i.libraries)
        case w: Widget => (Id(w.org, w.name) -> w.libraries)
        case l: Library => (Id(l.org, l.name) -> l.libraries)
        case lc: LayoutComponent => (Id(lc.org, lc.name) -> Seq.empty)
      }
    }
  }

  /**
    * Returns a topologically sorted [[Seq[Component]]] such that loading the js/css in this order will
    * not cause any issues.
    * @param ids
    * @param scope
    * @return
    */
  def resolveComponents(ids: Seq[Id], scope: Option[String] = None): Seq[Component] = {
    logger.debug(s"[resolveComponents] id: ${ids.map(_.name).mkString(",")}, scope: $scope")
    val sortedIds = resolveIds(ids, scope)
    val out = sortedIds.flatMap(id => components.find { c => c.id.orgNameMatch(id) })

    if (out.length != sortedIds.length) {
      val missing = sortedIds.filterNot { sid => components.exists(c => c.id.orgNameMatch(sid)) }
      logger.warn(s"Missing components: ${missing.mkString(",")} from possible ids: ${components.map(_.id).mkString(",")}")
    }
    out
  }

  /**
   * For a given set of ids, return a topologically sorted sequence of ids (plus their dependents).
   *
   * @param ids
   * @return
   */
  def resolveIds(ids: Seq[Id], scope: Option[String] = None): Seq[Id] = {

    logger.debug(s"[resolveIds]")

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
     *
     * @param i
     * @param acc
     * @return
     */
    def innerResolve(i: Seq[Id], acc: Seq[(Id, Seq[Id])]): Seq[(Id, Seq[Id])] = {

      logger.trace(s"[innerResolve]: id: $i, accumulator: $acc")

      def addToAcc(otherIds: Seq[Id])(rel: IdRelation) = {
        val (_, deps) = rel
        val nonAccumulatedDeps = deps.filterNot(depId => acc.map(_._1).exists(id => id.orgNameMatch(depId)))
        val newAcc = if (acc.contains(rel)) acc else acc :+ rel
        val idsRemaining = (otherIds ++ nonAccumulatedDeps).distinct
        innerResolve(idsRemaining, newAcc)
      }

      i match {
        case Nil => acc
        case head +: Nil => {
          scopedRelationships
            .find(t => t._1.orgNameMatch(head))
            .map(addToAcc(Nil))
            .getOrElse(innerResolve(Nil, acc))
        }
        case head +: rest => {
          scopedRelationships
            .find(t => t._1.orgNameMatch(head))
            .map(addToAcc(rest))
            .getOrElse(innerResolve(rest, acc))
        }
        case _ => {
          throw new IllegalStateException(s"Match failed for: $i - looking for 0, 1 or more [[Id]]")
        }
      }
    }

    val relations = innerResolve(ids, Seq())

    type OrgName = (String, String)
    type OrgRelation = (OrgName, Seq[OrgName])

    def orgName(id: Id): OrgName = id.org -> id.name

    logger.trace(s"[resolveIds] relations: $relations")

    //To simplify the topSort - we use string based tuples - the build the ids back up
    val orgNames: Seq[OrgRelation] = relations.map(t => orgName(t._1) -> t._2.map(orgName))
    val sortedRelations: Seq[OrgRelation] = TopologicalSorter.sort(orgNames: _*)
    val sortedIds = sortedRelations.map(r => Id(r._1._1, r._1._2))
    logger.trace(s"[resolveIds] sortedIds -> $sortedIds")
    val out = sortedIds.map(i => i.copy(scope = None)).distinct
    logger.trace(s"[resolveIds] return -> $out")
    out
  }

}
