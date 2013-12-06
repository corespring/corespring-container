package org.corespring.container.client.controllers.helpers

import org.corespring.container.components.model.LayoutComponent

trait LayoutComponentReading { self : Helpers =>

  def layoutTypesInXml(xmlString:String, components: Seq[LayoutComponent]) : Seq[String] = {

    val xml = scala.xml.XML.loadString(xmlString)

    val usedInXml = components.filter{ lc =>
      val name = tagName(lc.org, lc.name)
      (xml \\ name).length > 0
    }

    usedInXml.map(lc => tagName(lc.org, lc.name))
  }
}
