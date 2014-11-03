package org.corespring.container.client.controllers.helpers

import org.htmlcleaner._
import scala.util.matching.Regex

trait XhtmlProcessor {

  /**
   * Converts xhtml by moving custom tag names to attributes instead
   */
  def tagNamesToAttributes(xhtml: String): Option[String] = {

    val substitutedClosingTag = "(?<=<\\/)(corespring-.*?)(?=>)".r
      .replaceAllIn(xhtml,{m => "div"})

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
    val cleanHtml = serializer.getAsString(n)

    //the cleaner creates class="para " (with anextra blank) when the p does not have class
    //the regexp below removes that blank
    Some("""class="para """".r.replaceAllIn(cleanHtml, {m => """class="para""""}))
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



