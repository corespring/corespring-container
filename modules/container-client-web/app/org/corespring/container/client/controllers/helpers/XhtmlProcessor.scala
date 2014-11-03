package org.corespring.container.client.controllers.helpers

import org.htmlcleaner._
import scala.util.matching.Regex

trait XhtmlProcessor {

  /**
   * Converts xhtml by moving custom tag names to attributes instead
   */
  def tagNamesToAttributes(xhtml: String): Option[String] = {

    val substitutedClosingTag = "(?<=<\\/)(corespring-.*?)(?=>)".r
      .replaceAllIn(xhtml,{m => s"div"})

    val substitutedOpeningTag = "(?<=<)(corespring-.*?)(?=\\s|>)".r
      .replaceAllIn(substitutedClosingTag,{m => s"""div ${m.group(1)}="${m.group(1)}""""})

    val cleaner: HtmlCleaner = new HtmlCleaner()
    val transformations: CleanerTransformations = new CleanerTransformations()

    val pToDiv = new TagTransformation("p", "div", true)
    pToDiv.addAttributeTransformation("class", "para ${class}")
    transformations.addTransformation(pToDiv)
    cleaner.getProperties.setCleanerTransformations(transformations)

    cleaner.getProperties.setUseEmptyElementTags(false)
    cleaner.getProperties.setOmitXmlDeclaration(true)
    cleaner.getProperties.setOmitHtmlEnvelope(true)

    val n: TagNode = cleaner.clean(substitutedOpeningTag)
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

