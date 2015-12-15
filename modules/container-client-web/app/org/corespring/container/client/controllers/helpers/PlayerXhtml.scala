package org.corespring.container.client.controllers.helpers

import org.corespring.container.client.ItemAssetResolver
import org.htmlcleaner.{ TagNode, TagTransformation }

trait PlayerXhtml {

  def itemAssetResolver: ItemAssetResolver

  def mkXhtml(itemId: String, xhtml: String): String = {

    /** <p> -> <div class="para"/> */
    def pToDiv = {
      val pToDiv = new TagTransformation("p", "div", true)
      pToDiv.addAttributeTransformation("class", "para ${class}")
      pToDiv
    }

    /** a post processor to turn "para " to "para" */
    val cleanSpaceAfterPara = (n: TagNode) => {
      val divs = n.evaluateXPath("//div")
      divs.foreach((n: Object) => {
        import scala.collection.JavaConversions._
        val tag = n.asInstanceOf[TagNode]
        if (tag.getAttributeByName("class") == "para ") {
          tag.setAttributes(Map[String, String]("class" -> "para"))
        }
      })
    }

    /** a post processor to add the image path */
    val setImagePath = (xhtml: TagNode) => {
      val resolveItemAsset = itemAssetResolver.resolve(itemId)_
      val divs = xhtml.getElementsByName("img", true)
      divs.foreach((tag: TagNode) => {
        val attributes = tag.getAttributes
        attributes.put("src", resolveItemAsset(tag.getAttributeByName("src")))
        tag.setAttributes(attributes)
      })
    }

    val postProcessors = Seq(cleanSpaceAfterPara, setImagePath)
    XhtmlProcessor.process(Seq(pToDiv), postProcessors, xhtml)
  }
}

