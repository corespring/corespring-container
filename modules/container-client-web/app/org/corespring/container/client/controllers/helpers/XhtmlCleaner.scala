package org.corespring.container.client.controllers.helpers

import org.htmlcleaner.{CompactXmlSerializer, TagNode, HtmlCleaner}

object XhtmlCleaner{
  val cleaner = {
    val cleaner: HtmlCleaner = new HtmlCleaner()
    cleaner.getProperties.setUseEmptyElementTags(false)
    cleaner.getProperties.setOmitXmlDeclaration(true)
    cleaner.getProperties.setOmitHtmlEnvelope(true)
    cleaner
  }
}

trait XhtmlCleaner {

  def cleanXhtml(s:String) : String = {
    val n: TagNode = XhtmlCleaner.cleaner.clean(s)
    val serializer = new CompactXmlSerializer(XhtmlCleaner.cleaner.getProperties)
    serializer.getAsString(n)
  }
}
