package org.corespring.container.client.component

import play.api.libs.json.JsValue
import org.corespring.container.client.controllers.helpers.NameHelper
import org.corespring.container.components.model.LayoutComponent

trait ItemTypeReader {
  /** for an item - return all the components in use */
  def componentTypes(id:String, json: JsValue): Seq[String]
}

trait AllItemTypesReader extends ItemTypeReader with ComponentSplitter {
  override def componentTypes(id : String, json: JsValue): Seq[String] = components.map(_.componentType)
}

trait PlayerItemTypeReader extends ItemTypeReader with ComponentSplitter with NameHelper {

  /** List components used in the model */
  override def componentTypes(id : String, json: JsValue): Seq[String] = {
    val modelComponents: Seq[String] = (json \ "components" \\ "componentType").map(_.as[String]).distinct

    val validComponents = modelComponents.filter(modelComp => uiComponents.exists(ui => tagName(ui.org, ui.name) == modelComp))

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

    val xml = scala.xml.XML.loadString(xmlString)

    val usedInXml = components.filter {
      lc =>
        val name = tagName(lc.org, lc.name)
        val hasComponentAsAttribute = xml.child.exists(!_.attribute(name).isEmpty)
        (xml \\ name).length > 0 || hasComponentAsAttribute
    }

    usedInXml.map(lc => tagName(lc.org, lc.name))
  }

}
