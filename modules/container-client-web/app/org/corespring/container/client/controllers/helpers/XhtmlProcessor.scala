package org.corespring.container.client.controllers.helpers

import org.htmlcleaner._
import scala.xml.transform.{ RewriteRule, RuleTransformer }
import scala.xml.{ UnprefixedAttribute, Elem, Node, MinimizeMode }
import scala.util.matching.Regex
import play.api.Logger

trait XhtmlProcessor {

  private lazy val logger = Logger("container.xhtml.processor")

  /**
   * Converts xhtml by moving custom tag names to attributes instead
   */
  def tagNamesToAttributes(xhtml: String): Option[String] = rename(xhtml).map {
    renamed =>

      val opened = "<div (.*?)corespring-(.*?)/>".r.replaceAllIn(renamed, {
        m: Regex.Match =>
          s"<div ${m.group(1)}corespring-${m.group(2)}></div>"
      })

      val cleaner: HtmlCleaner = new HtmlCleaner()
      val transformations: CleanerTransformations = new CleanerTransformations()

      cleaner.getProperties.setUseEmptyElementTags(false)
      cleaner.getProperties.setOmitXmlDeclaration(true)
      cleaner.getProperties.setOmitHtmlEnvelope(true)
      cleaner.getProperties.setCleanerTransformations(transformations)
      val n: TagNode = cleaner.clean(opened)
      val serializer = new PrettyXmlSerializer(cleaner.getProperties, "")
      serializer.getAsString(n)
  }

  private def rename(xhtml: String) = read(xhtml).map {
    xml =>
      val xml = scala.xml.XML.loadString(xhtml)
      val rt = new RuleTransformer(ReplaceTag)
      val processed = rt.transform(xml)
      val sb = scala.xml.Utility.serialize(processed(0), minimizeTags = MinimizeMode.Never)
      sb.toString()
  }

  private def read(xml: String) = try {
    Some(scala.xml.XML.loadString(xml))
  } catch {
    case e: Throwable => {
      logger.error(s"Bad xml: $xml")
      None
    }
  }
}

object ReplaceTag extends RewriteRule {

  override def transform(n: Node) = n match {
    case e: Elem if (n.label.startsWith("corespring")) => {
      val m = new UnprefixedAttribute(e.label, "", e.attributes)
      val all = e.attributes.append(m)
      e.copy(label = "div", attributes = all)
    }
    case _ => {
      n
    }
  }
}

