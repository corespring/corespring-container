package org.corespring.container.client.component

import play.api.libs.json.JsValue
import org.corespring.container.client.controllers.helpers.{ XhtmlProcessor, NameHelper }
import org.corespring.container.components.model.{ComponentInfo, LayoutComponent}
import org.corespring.container.components.model.dependencies.ComponentSplitter
import play.api.mvc.RequestHeader

trait ItemTypeReader {
  /** for an item - return all the components in use */
  def componentTypes(json: JsValue)/*(implicit request : RequestHeader)*/: Seq[String]
}

trait AllItemTypesReader extends ItemTypeReader with ComponentSplitter {
  override def componentTypes(json: JsValue)/*(implicit request : RequestHeader)*/: Seq[String] = components.map(_.componentType)
}

trait PlayerItemTypeReader extends ItemTypeReader with ComponentSplitter with NameHelper with XhtmlProcessor {

  /** List components used in the model */
  override def componentTypes(json: JsValue)/*(implicit request : RequestHeader)*/: Seq[String] = {
    val types: Seq[String] = (json \ "components" \\ "componentType").map(_.as[String]).distinct

    def componentTypeMatches(t: String)(ci:ComponentInfo) = tagName(ci.id.org, ci.id.name) == t

    val validComponents = types.filter{
      t =>
        interactions.exists(componentTypeMatches(t)) || widgets.exists(componentTypeMatches(t))
    }

    def layoutComponentsInItem: Seq[String] = {
      val out: Seq[String] = (json \ "xhtml").asOpt[String].map {
        l =>
          layoutTypesInXml(l, layoutComponents)
      }.getOrElse(Seq())
      out
    }
    validComponents ++ layoutComponentsInItem
  }

  private def layoutTypesInXml(xmlString: String, components: Seq[LayoutComponent]): Seq[String] = {

    //Note: the xhtml may not have a single root - so we wrap it
    val xml = scala.xml.XML.loadString(toWellFormedXhtml(xmlString))

    val usedInXml = components.filter {
      lc =>
        val name = tagName(lc.org, lc.name)
        val hasComponentAsAttribute = xml.child.exists(!_.attribute(name).isEmpty)
        (xml \\ name).length > 0 || hasComponentAsAttribute
    }

    usedInXml.map(lc => tagName(lc.org, lc.name))
  }

}
