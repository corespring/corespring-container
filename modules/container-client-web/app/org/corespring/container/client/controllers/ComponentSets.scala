package org.corespring.container.client.controllers

import org.corespring.container.client.component.{PlayerGenerator, SourceGenerator, EditorGenerator, ComponentUrls}
import org.corespring.container.components.model.Component
import play.api.http.ContentTypes
import play.api.mvc.{AnyContent, Action, Controller}
import play.api.Logger

trait ComponentSets extends Controller {

  def resource(context: String, hash: String, suffix: String): Action[AnyContent]

  /*= {
    Action {
      request =>

        logger.debug(s"load: $hash $suffix")

        val notModified = for {
          requestEtag <- request.headers.get(IF_NONE_MATCH)
          etag <- cache.getAs[String](PreCache.etagKey(hash))
          if requestEtag == "*" || etag == requestEtag
        } yield {
          logger.trace(s"[resource] $hash - not modified")
          NotModified
        }

        notModified.getOrElse {
          val result = cache.getAs[SimpleResult](hash)
          logger.trace(s"${cache.uid}: $hash exists in cache? ${ result.isDefined }")
          result.getOrElse(NotFound(""))
        }
    }
  }
  */
}

trait DevComponentSets extends ComponentSets with ComponentUrls {

  private lazy val logger = Logger("container.dev.component.sets")

  def components: Seq[Component]

  implicit val compOrdering : Ordering[Component] = Ordering.by[Component,String](_.componentType)

  private def hash(comps: List[String]): String = s"${comps.mkString(",").hashCode}"

  private def hashToComponentsMap: Map[String, List[String]] = {
    def comboToKeyValue(c: List[String]): (String, List[String]) ={
      logger.trace("comboToKeyValue")
      val h = hash(c)
      logger.trace(s"$h -> $c")
      (s"$h" -> c)
    }
    everyCombination(components.toList.map(_.componentType), comboToKeyValue).toMap
  }

  private def everyCombination[A, B](l: List[A], fn: List[A] => B)(implicit o : Ordering[A]): List[B] = {
    logger.trace(s"everyCombination: $l")
    val listCombos = l.toSet[A].subsets.map(_.toList).toList
    logger.trace(s"combos: $listCombos")
    listCombos.map(fn)
  }

  def buildSource(context: String, suffix: String, components: List[Component]): String = {

    def gen(generator: SourceGenerator) = suffix match {
      case "js" => generator.js(components.toSeq)
      case "css" => generator.css(components.toSeq)
      case _ => ""
    }

    context match {
      case "editor" => gen(new EditorGenerator())
      case "player" => gen(new PlayerGenerator())
      case "rig" => gen(new PlayerGenerator())
      case _ => throw new RuntimeException("Error")
    }
  }

  override def cssUrl(context: String, comps: Seq[Component]): String = routes.ComponentSets.resource(context, hash(comps.map(_.componentType).toList), "css").url

  override def jsUrl(context: String, comps: Seq[Component]): String = routes.ComponentSets.resource(context, hash(comps.map(_.componentType).toList), "js").url

  override def resource(context: String, hash: String, suffix: String): Action[AnyContent] = Action {
    request =>

      logger.debug(s"load resource: $context, $hash, $suffix")

      hashToComponentsMap.get(hash).map {
        comps =>

          val c = comps.map{ n => components.find(_.componentType == n)}.flatten
          val out = buildSource(context, suffix, c.toList)
          val contentType = suffix match {
            case "js" => ContentTypes.JAVASCRIPT
            case "css" => ContentTypes.CSS
            case _ => throw new RuntimeException(s"Unknown suffix: $suffix")
          }
          Ok(out).as(contentType)
      }.getOrElse(NotFound(""))
  }
}
