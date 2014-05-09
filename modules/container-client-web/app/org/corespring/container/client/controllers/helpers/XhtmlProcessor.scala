package org.corespring.container.client.controllers.helpers

import org.htmlcleaner._
import scala.util.matching.Regex

trait XhtmlProcessor {

  /**
   * Converts xhtml by moving custom tag names to attributes instead
   */
  def tagNamesToAttributes(xhtml: String): Option[String] = {

    val tagsFixed = "<(corespring-.*?)(\\w.*?>)".r.replaceAllIn(xhtml, {
      m: Regex.Match =>
        s"<div ${m.group(1)}${m.group(2)}</div>"
    })

    val cleaner: HtmlCleaner = new HtmlCleaner()
    val transformations: CleanerTransformations = new CleanerTransformations()

    val customToDiv = new TagTransformation()
    transformations.addTransformation(customToDiv)
    cleaner.getProperties.setUseEmptyElementTags(false)
    cleaner.getProperties.setOmitXmlDeclaration(true)
    cleaner.getProperties.setOmitHtmlEnvelope(true)
    cleaner.getProperties.setCleanerTransformations(transformations)
    val n: TagNode = cleaner.clean(tagsFixed)
    val serializer = new CompactXmlSerializer(cleaner.getProperties)
    Some(serializer.getAsString(n))
  }

  def toWellFormedXhtml(html: String): String = {
    val cleaner: HtmlCleaner = new HtmlCleaner()
    cleaner.getProperties.setUseEmptyElementTags(false)
    cleaner.getProperties.setOmitXmlDeclaration(true)
    cleaner.getProperties.setOmitHtmlEnvelope(false)
    val n: TagNode = cleaner.clean(html)
    val serializer = new CompactXmlSerializer(cleaner.getProperties)
    serializer.getAsString(n)
  }
}

