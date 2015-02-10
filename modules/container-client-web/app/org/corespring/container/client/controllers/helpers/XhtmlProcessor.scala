package org.corespring.container.client.controllers.helpers

import org.htmlcleaner._
import scala.util.matching.Regex

trait XhtmlProcessor {

  /**
   * Converts xhtml by moving custom tag names to attributes instead
   * TODO: This should *NOT* use regular expressions. Should parse DOM using scala.xml._
   */
  def tagNamesToAttributes(xhtml: String): String = {
    val replacements: Seq[String => String] = Seq(
      s => "(?<=<\\/)(corespring-.*?)(?=>)".r.replaceAllIn(s, { m => "div"}),
      s => "(?<=<)(corespring-.*?)(?=\\s|>)".r.replaceAllIn(s, { m => s"""div ${m.group(1)}="${m.group(1)}""""})
    )
    replacements.foldLeft(xhtml)((replacement, acc) => acc(replacement))
  }

  def cleanXhtml(xhtml: String) = {

    val cleaner: HtmlCleaner = new HtmlCleaner()
    val transformations: CleanerTransformations = new CleanerTransformations()

    val pToDiv = new TagTransformation("p", "div", true)
    pToDiv.addAttributeTransformation("class", "para ${class}")
    transformations.addTransformation(pToDiv)
    cleaner.getProperties.setCleanerTransformations(transformations)

    cleaner.getProperties.setUseEmptyElementTags(false)
    cleaner.getProperties.setOmitXmlDeclaration(true)
    cleaner.getProperties.setOmitHtmlEnvelope(true)

    val n: TagNode = cleaner.clean(xhtml)
    val serializer = new CompactXmlSerializer(cleaner.getProperties)
    val cleanHtml = serializer.getAsString(n)

    //the cleaner creates class="para " (with an extra blank) when the p does not have class
    //the regexp below removes that blank
    """class="para """".r.replaceAllIn(cleanHtml, {m => """class="para""""})
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

object XhtmlProcessor extends XhtmlProcessor {

  implicit class StringWithProcessor(string: String) {
    def tagNamesToAttributes = XhtmlProcessor.super.tagNamesToAttributes(string)
    def cleanXhtml = XhtmlProcessor.super.cleanXhtml(string)
    def toWellFormedXhtml = XhtmlProcessor.super.toWellFormedXhtml(string)
  }

}



