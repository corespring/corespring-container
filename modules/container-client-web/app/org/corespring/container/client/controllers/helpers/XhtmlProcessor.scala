package org.corespring.container.client.controllers.helpers

import org.htmlcleaner._

object XhtmlProcessor {

  def process(transformations:Seq[TagTransformation],
               postProcessors : Seq[TagNode => Unit],
               xhtml:String) : String = {

    val cleaner: HtmlCleaner = getCleaner
    val transformationHolder: CleanerTransformations = new CleanerTransformations()
    transformations.foreach(transformationHolder.addTransformation)
    cleaner.getProperties.setCleanerTransformations(transformationHolder)
    val n: TagNode = cleaner.clean(xhtml)
    postProcessors.foreach(pp => pp(n))
    serialize(n, cleaner)
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
      require(Seq("div", "span").contains(wrapperTag), "You can only wram in div or span")
      s"<$wrapperTag>$out</$wrapperTag>"
    }
  }

  def isValidXml(html:String) : Boolean = try{
    scala.xml.XML.loadString(html)
    true
  } catch {
    case e : Throwable => false
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



