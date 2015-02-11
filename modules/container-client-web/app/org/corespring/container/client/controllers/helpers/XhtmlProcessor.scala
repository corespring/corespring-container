package org.corespring.container.client.controllers.helpers

import org.xml.sax.SAXParseException

import scala.xml.transform.{RewriteRule, RuleTransformer}
import scala.xml._

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

  def translateParagraphsToDivs(xhtml: String) = new RuleTransformer(new RewriteRule {
    override def transform(n: Node) = n match {
      case n: Elem if n.label == "p" => n.copy(label = "div") %
        Attribute(null, "class",
          s"para${n.attribute("class").map(c => if (c.text.isEmpty) "" else s" ${c.text}").getOrElse("")}",
          Null)
      case n => n
    }
  }).transform(stringToNodes(xhtml)).mkString

  private def stringToNodes(xhtml: String): NodeSeq = {
    val wrapper = "div"
    XML.loadString(s"<$wrapper>$xhtml</$wrapper>").child
  }

}

object XhtmlProcessor extends XhtmlProcessor {

  implicit class StringWithProcessor(string: String) {
    def tagNamesToAttributes = XhtmlProcessor.super.tagNamesToAttributes(string)
    def translateParagraphsToDivs = XhtmlProcessor.super.translateParagraphsToDivs(string)

    def toWellFormedXhtml = string.tagNamesToAttributes.translateParagraphsToDivs
  }

}



