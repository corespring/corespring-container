package org.corespring.container.client.controllers.helpers

import scala.xml.transform.{RuleTransformer, RewriteRule}
import scala.xml._
import org.htmlcleaner._

trait XhtmlProcessor {

  /**
   * Converts xhtml by moving custom tag names to attributes instead
   */
  def tagNamesToAttributes(tagNames: Seq[(String,String)], xhtml : String) : String = {

      val cleaner : HtmlCleaner  = new HtmlCleaner()
      val transformations : CleanerTransformations = new CleanerTransformations()

      tagNames.foreach{ tuple =>
        val (from, to) = tuple
        val tt = new TagTransformation(from, to, true )
        tt.addAttributeTransformation(from, "")
        transformations.addTransformation(tt)
      }

      cleaner.getProperties.setUseEmptyElementTags(false)
      cleaner.getProperties.setOmitXmlDeclaration(true)
      cleaner.getProperties.setOmitHtmlEnvelope(true)
      cleaner.getProperties.setCleanerTransformations(transformations)
      val n : TagNode = cleaner.clean(xhtml)
      val serializer = new PrettyXmlSerializer(cleaner.getProperties, "")
      serializer.getAsString(n)
  }
}


