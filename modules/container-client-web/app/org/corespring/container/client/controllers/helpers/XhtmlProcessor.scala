package org.corespring.container.client.controllers.helpers

import org.htmlcleaner._

object XhtmlProcessor {

  /**
   * Converts xhtml by moving custom tag names to attributes instead
   */
  def tagNamesToAttributes(tags:Seq[String])(xhtml: String): Option[String] = {

    val cleaner: HtmlCleaner = getCleaner
    val transformations: CleanerTransformations = new CleanerTransformations()

    transformations.addTransformation(pToDiv)
    tags.foreach{ t =>
      val transformation = new TagTransformation(t, "div", true)
      transformation.addAttributeTransformation(t, "")
      transformations.addTransformation(transformation)
    }

    cleaner.getProperties.setCleanerTransformations(transformations)

    val n: TagNode = cleaner.clean(xhtml)

    val paras = n.evaluateXPath("//div")

    paras.foreach(cleanParaSpace)

    Some(serialize(n, cleaner))
  }

  private def cleanParaSpace(n:Object) {
    import scala.collection.JavaConversions._
    val tag = n.asInstanceOf[TagNode]
    if( tag.getAttributeByName("class") == "para "){
      tag.setAttributes(Map[String,String]("class" -> "para"))
    }
  }

  private def pToDiv = {
    val pToDiv = new TagTransformation("p", "div", true)
    pToDiv.addAttributeTransformation("class", "para ${class}")
    pToDiv.addAttributePatternTransformation("class".r.pattern, "para ".r.pattern, "para")
    pToDiv
  }

  private def isValidXml(html:String) : Boolean = try{
    scala.xml.XML.loadString(html)
    true
  } catch {
    case e : Throwable => false
  }

  /**
   * Returns wellformed xhtml aka it is parseable by an xml parser
   * Makes minimal changes and only wraps the content if it needs to
   * @param html
   * @param wrapperTag
   * @return
   */
  def toWellFormedXhtml(html: String, wrapperTag: String = "div"): String = {
    val cleaner = getCleaner
    val n: TagNode = cleaner.clean(html)
    val out = serialize(n, cleaner)

    if(isValidXml(out)){
      out
    } else {
      s"<$wrapperTag>$out</$wrapperTag>"
    }
  }

  private def getCleaner = {
    val cleaner: HtmlCleaner = new HtmlCleaner()
    cleaner.getProperties.setUseEmptyElementTags(false)
    cleaner.getProperties.setOmitXmlDeclaration(true)
    cleaner.getProperties.setOmitHtmlEnvelope(true)
    cleaner
  }

  private def serialize(n:TagNode, cleaner: HtmlCleaner) : String = {
    val serializer = new SimpleHtmlSerializer(cleaner.getProperties)
    serializer.getAsString(n)
  }

}



