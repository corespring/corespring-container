package org.corespring.container.client.component

import org.corespring.container.client.controllers.helpers.NameHelper
import org.corespring.container.components.model._
import play.api.libs.json.JsValue

trait ComponentSplitter {

  def components : Seq[Component]

  def uiComponents: Seq[UiComponent] = filterByType[UiComponent](components)

  def libraries: Seq[Library] = filterByType[Library](components)

  def layoutComponents: Seq[LayoutComponent] = filterByType[LayoutComponent](components)

  private def filterByType[T](comps: Seq[Component])(implicit m: scala.reflect.Manifest[T]): Seq[T] = comps.filter(c => m.runtimeClass.isInstance(c)).map(_.asInstanceOf[T])
}

trait ItemTypeReader extends ComponentSplitter with NameHelper{

  /** List components used in the model */
  def typesInItem(json : JsValue) : Seq[String] = {
    val modelComponents : Seq[String] = (json \ "components" \\ "componentType").map(_.as[String]).distinct

    val validComponents = modelComponents.filter( modelComp => uiComponents.exists( ui => tagName(ui.org, ui.name) == modelComp))

    def layoutComponentsInItem: Seq[String] = {
      val out: Seq[String] = (json \ "xhtml").asOpt[String].map {
        l =>
          layoutTypesInXml(l, layoutComponents)
      }.getOrElse(Seq())
      out
    }
    validComponents ++ layoutComponentsInItem
  }

  private def layoutTypesInXml(xmlString:String, components: Seq[LayoutComponent]) : Seq[String] = {

    val xml = scala.xml.XML.loadString(xmlString)

    val usedInXml = components.filter{ lc =>
      val name = tagName(lc.org, lc.name)
      val hasComponentAsAttribute = xml.child.exists(!_.attribute(name).isEmpty)
      (xml \\ name).length > 0 || hasComponentAsAttribute
    }

    usedInXml.map(lc => tagName(lc.org, lc.name))
  }
}


trait DependencyResolver extends ComponentSplitter{

  /** returns a list of all components used including libraries */
  def componentsForTypes(types:Seq[Id], scope : String) : Seq[Component] = {

    def withinScope(id: LibraryId) = id.scope.map( _ == scope ).getOrElse(true)
    def compMatchesTag(c: Component) = types.exists(id => id.org == c.id.org && id.name == c.id.name)

    val uiComps = uiComponents.filter(compMatchesTag)
    val libraryIds = uiComps.map(_.libraries).flatten.distinct.filter(withinScope)
    val libs = libraries.filter(l => libraryIds.exists(l.id.matches(_)))
    val layoutComps = layoutComponents.filter(compMatchesTag)
    (libs ++ uiComps ++ layoutComps).distinct
  }

}
